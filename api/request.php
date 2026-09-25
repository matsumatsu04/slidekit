<?php
/**
 * SlideKit リクエストフォームの受け口。
 * - 保存: 公開領域の外 <ドメイン>/slidekit-data/requests.jsonl に1行1件で追記
 * - 通知: 同フォルダに config.php があり SLIDEKIT_WEBHOOK_URL が定義されていれば
 *         Discord Webhook へ送る（無ければ・失敗しても保存できていれば成功として返す）
 * - スパム対策: honeypot（website 欄）／文字数上限／同一IPは20秒に1件まで
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

function out($arr, $code = 200) {
    http_response_code($code);
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(['ok' => false, 'error' => 'POSTのみ受け付けます'], 405);
}

// post_max_size 超過時はPHPに $_POST/$_FILES が空で渡ってくる。無言で弾かず理由を返す
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && empty($_POST) && empty($_FILES)) {
    out(['ok' => false, 'error' => '送信サイズが大きすぎます。添付を減らす・小さくするなどして再度お試しください'], 413);
}

// $_POST の値を文字列で取る。name[]=... のように配列で送られると trim() が TypeError で
// 500（JSONでない応答）になるので、文字列以外は空として扱う
function post_str($key) {
    $v = $_POST[$key] ?? '';
    return is_string($v) ? $v : '';
}

// honeypot（人間には見えない欄。埋まっていたらbot）
if (trim(post_str('website')) !== '') {
    out(['ok' => true]); // botには成功したように見せる
}

// ブラウザは textarea の改行を CRLF で送るが、画面の maxlength（4000）は改行を1文字で数える。
// そのまま数えると改行の数だけ多くなり、画面では収まっているのに弾かれるので LF にそろえてから数える
$name = trim(preg_replace('/[\x00-\x1F\x7F]+/', ' ', post_str('name'))); // 名前に改行・制御文字は要らない
$type = trim(post_str('type'));
$body = trim(str_replace(["\r\n", "\r"], "\n", post_str('body')));

$types = ['機能の要望', '不具合・気になる点', '欲しい構図パターン', 'その他'];
if ($name === '' || $body === '') {
    out(['ok' => false, 'error' => 'お名前と内容は必須です'], 400);
}
if (!mb_check_encoding($name . $body, 'UTF-8')
    || mb_strlen($name) > 100 || mb_strlen($body) > 4000 || !in_array($type, $types, true)) {
    out(['ok' => false, 'error' => '入力内容を確認してください'], 400);
}

// 同一IPの連投を抑える（20秒に1件）
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$gate = sys_get_temp_dir() . '/sk-req-' . md5($ip);
if (is_file($gate) && (time() - filemtime($gate)) < 20) {
    out(['ok' => false, 'error' => '送信間隔が短すぎます。少し待ってからお試しください'], 429);
}
@touch($gate);

// 保存先: 公開領域（public_html）の外（例 <ドメインDIR>/slidekit-data/）。
// サブドメインでは DOCUMENT_ROOT が public_html のさらに下（.../public_html/slide）になるため、
// パス中の public_html を探してその親を基準にする（2026-08-28 実測）。
$docroot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
if ($docroot === '') {
    out(['ok' => false, 'error' => 'サーバー設定エラー'], 500);
}
$pos = strpos($docroot, '/public_html');
$base = $pos !== false ? substr($docroot, 0, $pos) : dirname($docroot);
$dataDir = $base . '/slidekit-data';
if (!is_dir($dataDir) && !@mkdir($dataDir, 0700, true)) {
    out(['ok' => false, 'error' => 'サーバー設定エラー（保存先）'], 500);
}

// 添付（画像・PDF）: 最大5ファイル・各10MB。MIMEは中身（finfo）で検証する
$savedFiles = [];
$uploadErr  = null;
if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
    $okMime = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp',
               'image/gif' => 'gif', 'application/pdf' => 'pdf'];
    $count  = count($_FILES['files']['name']);
    if ($count > 5) { out(['ok' => false, 'error' => '添付は最大5つまでです'], 400); }
    $upDir = $dataDir . '/uploads/' . date('Ymd-His') . '-' . substr(md5((string)mt_rand()), 0, 6);
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    for ($i = 0; $i < $count; $i++) {
        if (($_FILES['files']['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $uploadErr = '添付のアップロードに失敗しました（サイズ上限の可能性）'; continue;
        }
        $tmp  = $_FILES['files']['tmp_name'][$i];
        $size = (int)($_FILES['files']['size'][$i] ?? 0);
        if (!is_uploaded_file($tmp)) { continue; }
        if ($size <= 0 || $size > 10 * 1024 * 1024) { $uploadErr = '10MBを超える添付はスキップしました'; continue; }
        $mime = $finfo ? finfo_file($finfo, $tmp) : '';
        if (!isset($okMime[$mime])) { $uploadErr = '画像・PDF以外の添付はスキップしました'; continue; }
        if (empty($savedFiles) && !is_dir($upDir) && !@mkdir($upDir, 0700, true)) {
            $uploadErr = '添付の保存に失敗しました'; continue;
        }
        $orig = (string)($_FILES['files']['name'][$i] ?? '');
        $fname = preg_replace('/[^0-9A-Za-z._\-ぁ-んァ-ヶ一-龠ー]/u', '_', basename($orig));
        $fname = mb_substr($fname !== '' ? $fname : 'file', 0, 80);
        if (!preg_match('/\.' . $okMime[$mime] . '$/i', $fname) && !($mime === 'image/jpeg' && preg_match('/\.jpe?g$/i', $fname))) {
            $fname .= '.' . $okMime[$mime];
        }
        $dest = $upDir . '/' . sprintf('%02d', $i + 1) . '-' . $fname;
        if (@move_uploaded_file($tmp, $dest)) {
            $savedFiles[] = ['name' => $fname, 'size' => $size, 'mime' => $mime, 'path' => $dest];
        } else {
            $uploadErr = '添付の保存に失敗しました';
        }
    }
    if ($finfo) { finfo_close($finfo); }
}

$rec = [
    'at'    => date('c'),
    'name'  => $name,
    'type'  => $type,
    'body'  => $body,
    'files' => array_map(function ($f) { return ['name' => $f['name'], 'size' => $f['size'], 'mime' => $f['mime'], 'path' => $f['path']]; }, $savedFiles),
    'ip'    => $ip,
    'ua'    => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
];
if ($uploadErr !== null) {
    $rec['upload_error'] = $uploadErr; // 添付の一部を受け取れなかった（本文は保存する）
}
// UA などに壊れたUTF-8が混じると json_encode が false を返し、空行だけ保存されて記録が消えるので置換して書く
$json = json_encode($rec, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
if ($json === false || @file_put_contents($dataDir . '/requests.jsonl', $json . "\n", FILE_APPEND | LOCK_EX) === false) {
    out(['ok' => false, 'error' => '保存に失敗しました'], 500);
}

// Discord通知（設定があれば。失敗しても保存済みなので成功として返す）
$configFile = $dataDir . '/config.php';
if (is_file($configFile)) {
    include $configFile;
    if (defined('SLIDEKIT_WEBHOOK_URL') && SLIDEKIT_WEBHOOK_URL !== '') {
        // 名前は Discord の書式記号をエスケープする（* や _ で太字が崩れる・` で囲みが壊れるのを防ぐ）
        $nameMd = preg_replace('/([\\\\*_~`|>])/', '\\\\$1', $name);
        $bodyMd = str_replace('```', "'''", mb_substr($body, 0, 1500)); // 本文の ``` で囲みが閉じないように
        if (mb_strlen($body) > 1500) {
            $bodyMd .= "\n…（続きは requests.jsonl）";
        }
        $msg = "📮 **SlideKitリクエスト**（{$type}）\n"
             . "**{$nameMd}** さんより\n"
             . "```\n" . $bodyMd . "\n```";
        if ($uploadErr !== null) {
            $msg .= "\n⚠ " . $uploadErr;
        }

        // 添付はDiscordにもそのまま転送する（まつつがDiscord上で直接見られるように）。
        // Discord は1回の送信の合計が 25MiB を超えると本文ごと失敗する（10MB×5枚＝最大50MBになり得る）。
        // 合計 24MiB までを載せ、残りはサーバー保存のみ（件数を本文に書く）
        $files = [];
        $total = 0;
        foreach ($savedFiles as $f) {
            if (count($files) >= 10 || $total + $f['size'] > 24 * 1024 * 1024) { continue; }
            $files[] = $f;
            $total += $f['size'];
        }
        if (!empty($savedFiles)) {
            $msg .= "\n📎 添付 " . count($savedFiles) . '件';
            if (count($files) < count($savedFiles)) {
                $msg .= '（容量の都合で ' . (count($savedFiles) - count($files)) . '件はDiscordに載せず・サーバーに保存済み）';
            }
        }

        // 送信。@everyone やロールのメンションが本文・名前に書かれていても通知が飛ばないよう allowed_mentions で全て無効にする
        $send = function ($content, $withFiles) use ($files) {
            $post = ['payload_json' => json_encode(
                ['content' => $content, 'allowed_mentions' => ['parse' => []]],
                JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
            )];
            if ($withFiles) {
                foreach ($files as $n => $f) {
                    $post['files[' . $n . ']'] = new CURLFile($f['path'], $f['mime'], $f['name']);
                }
            }
            $ch = curl_init(SLIDEKIT_WEBHOOK_URL);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $post, // multipart/form-data（添付なしでも可）
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
            ]);
            $res  = @curl_exec($ch);
            $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $cerr = curl_error($ch);
            @curl_close($ch);
            return [$code >= 200 && $code < 300, $code, $cerr, is_string($res) ? mb_substr($res, 0, 300) : ''];
        };
        $r = $send($msg, !empty($files));
        if (!$r[0] && !empty($files)) {
            // 添付のせいで失敗した可能性があるので、本文だけでもう一度送る
            $r2 = $send($msg . "\n（添付の転送に失敗。サーバーに保存済み）", false);
            if ($r2[0]) { $r = $r2; } else { $r[3] .= ' / retry: HTTP ' . $r2[1] . ' ' . $r2[2]; }
        }
        if (!$r[0]) {
            // 保存はできているので利用者には成功を返す。通知が止まっていることに気づけるよう記録だけ残す
            @file_put_contents($dataDir . '/notify-errors.log',
                date('c') . " HTTP {$r[1]} {$r[2]} {$r[3]}\n", FILE_APPEND | LOCK_EX);
        }
    }
}

// 添付の一部を受け取れなかったときは、送信自体は成功として理由を添える（画面の完了表示に出す）
out($uploadErr !== null ? ['ok' => true, 'warn' => $uploadErr] : ['ok' => true]);
