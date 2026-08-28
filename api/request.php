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

// 保存先: public_html の外（例 /home/xxx/macminol.com/slidekit-data/）
$docroot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
$dataDir = $docroot !== '' ? dirname($docroot) . '/slidekit-data' : null;
if ($dataDir === null) {
    out(['ok' => false, 'error' => 'サーバー設定エラー'], 500);
}
if (!is_dir($dataDir) && !@mkdir($dataDir, 0700, true)) {
    out(['ok' => false, 'error' => 'サーバー設定エラー（保存先）'], 500);
}

$rec = [
    'at'   => date('c'),
    'name' => $name,
    'type' => $type,
    'body' => $body,
    'ip'   => $ip,
    'ua'   => mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200),
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
        $payload = json_encode(['content' => $msg], JSON_UNESCAPED_UNICODE);
        $ch = curl_init(SLIDEKIT_WEBHOOK_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        @curl_exec($ch);
        @curl_close($ch);
    }
}

out(['ok' => true]);
