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

// honeypot（人間には見えない欄。埋まっていたらbot）
if (trim($_POST['website'] ?? '') !== '') {
    out(['ok' => true]); // botには成功したように見せる
}

$name = trim($_POST['name'] ?? '');
$type = trim($_POST['type'] ?? '');
$body = trim($_POST['body'] ?? '');

$types = ['機能の要望', '不具合・気になる点', '欲しい構図パターン', 'その他'];
if ($name === '' || $body === '') {
    out(['ok' => false, 'error' => 'お名前と内容は必須です'], 400);
}
if (mb_strlen($name) > 100 || mb_strlen($body) > 4000 || !in_array($type, $types, true)) {
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
        $base = preg_replace('/[^0-9A-Za-z._\-ぁ-んァ-ヶ一-龠ー]/u', '_', basename($orig));
        $base = mb_substr($base !== '' ? $base : 'file', 0, 80);
        if (!preg_match('/\.' . $okMime[$mime] . '$/i', $base) && !($mime === 'image/jpeg' && preg_match('/\.jpe?g$/i', $base))) {
            $base .= '.' . $okMime[$mime];
        }
        $dest = $upDir . '/' . sprintf('%02d', $i + 1) . '-' . $base;
        if (@move_uploaded_file($tmp, $dest)) {
            $savedFiles[] = ['name' => $base, 'size' => $size, 'mime' => $mime, 'path' => $dest];
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
$line = json_encode($rec, JSON_UNESCAPED_UNICODE) . "\n";
if (@file_put_contents($dataDir . '/requests.jsonl', $line, FILE_APPEND | LOCK_EX) === false) {
    out(['ok' => false, 'error' => '保存に失敗しました'], 500);
}

// Discord通知（設定があれば。失敗しても保存済みなので成功として返す）
$configFile = $dataDir . '/config.php';
if (is_file($configFile)) {
    include $configFile;
    if (defined('SLIDEKIT_WEBHOOK_URL') && SLIDEKIT_WEBHOOK_URL !== '') {
        $msg = "📮 **SlideKitリクエスト**（{$type}）\n"
             . "**{$name}** さんより\n"
             . "```\n" . mb_substr($body, 0, 1500) . "\n```";
        if (!empty($savedFiles)) {
            $msg .= '📎 添付 ' . count($savedFiles) . '件';
        }
        // 添付はDiscordにもそのまま転送する（まつつがDiscord上で直接見られるように）。
        // Discord側の上限（10MB/ファイル）はアップロード時の上限と同じなので基本すべて送れる。
        $post  = ['payload_json' => json_encode(['content' => $msg], JSON_UNESCAPED_UNICODE)];
        $n = 0;
        foreach ($savedFiles as $f) {
            if ($n >= 10) { break; }
            $post['files[' . $n . ']'] = new CURLFile($f['path'], $f['mime'], $f['name']);
            $n++;
        }
        $ch = curl_init(SLIDEKIT_WEBHOOK_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $post, // multipart/form-data（添付なしでも可）
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
        ]);
        @curl_exec($ch);
        @curl_close($ch);
    }
}

out(['ok' => true]);
