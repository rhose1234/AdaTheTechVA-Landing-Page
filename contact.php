<?php
declare(strict_types=1);

function respond(int $status, string $title, string $message): never
{
    http_response_code($status);
    header('Cache-Control: no-store');

    if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['title' => $title, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        exit;
    }

    header('Content-Type: text/html; charset=UTF-8');

    $safeTitle = htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . $safeTitle . ' | AdaTheVA HealthTech Academy</title><style>body{margin:0;padding:2rem;font:16px/1.6 system-ui,sans-serif;color:#173f48;background:#f4f9f8}.card{max-width:620px;margin:10vh auto;padding:clamp(1.5rem,5vw,3rem);border:1px solid #d9eae8;border-radius:1rem;background:#fff}h1{color:#064a5d}a{color:#078e87;font-weight:700}</style></head><body><main class="card"><h1>' . $safeTitle . '</h1><p>' . $safeMessage . '</p><a href="./index.html#contact">Return to the contact form</a></main></body></html>';
    exit;
}

function clean_text(string $value, bool $allowNewlines = false): string
{
    $value = strip_tags(str_replace(["\r\n", "\r"], "\n", $value));
    $controls = $allowNewlines ? '/[\x00-\x09\x0B-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    return trim(preg_replace($controls, '', $value) ?? '');
}

function text_length(string $value): int
{
    $count = preg_match_all('/./us', $value);
    return $count === false ? PHP_INT_MAX : $count;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'Method not allowed', 'Please use the contact form to send a message.');
}

$rawName = $_POST['name'] ?? '';
$rawEmail = $_POST['email'] ?? '';
$rawMessage = $_POST['message'] ?? '';
$name = is_string($rawName) ? $rawName : '';
$email = is_string($rawEmail) ? trim($rawEmail) : '';
$message = is_string($rawMessage) ? $rawMessage : '';
$honeypot = is_string($_POST['website'] ?? null) ? trim($_POST['website']) : '';
$loadedAt = is_string($_POST['form_loaded_at'] ?? null) ? $_POST['form_loaded_at'] : '';

// Silently accept honeypot submissions to avoid helping bots refine their requests.
if ($honeypot !== '') {
    respond(200, 'Message received', 'Thank you for contacting AdaTheVA HealthTech Academy.');
}

if (!preg_match('//u', $name) || !preg_match('//u', $message) || !preg_match('//u', $email)) {
    respond(400, 'Check your message', 'Please check the name, email address, and message, then try again.');
}

$name = clean_text($name);
$email = filter_var($email, FILTER_SANITIZE_EMAIL) ?: '';
$message = clean_text($message, true);
$message = preg_replace("/\n{4,}/", "\n\n\n", $message) ?? $message;

$elapsed = ctype_digit($loadedAt) ? time() - (int) $loadedAt : -1;
$hasValidContent = preg_match('/[\p{L}\p{N}]/u', $message) === 1;
$urlCount = preg_match_all('/(?:https?:\/\/|www\.)/i', $message);

if ($elapsed < 2 || $elapsed > 14400 || $name === '' || text_length($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 || $message === '' || text_length($message) > 5000 || !$hasValidContent || $urlCount === false || $urlCount > 2) {
    respond(400, 'Check your message', 'Please provide a valid name and email, a message under 5,000 characters, and no more than two links.');
}

$subject = 'Website contact form message';
$body = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}\n";
$headers = [
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

if (!mail('info@adathevahealthtech.com', $subject, $body, implode("\r\n", $headers))) {
    respond(503, 'Message could not be sent', 'The mail service is temporarily unavailable. Please try again later or email info@adathevahealthtech.com directly.');
}

respond(200, 'Thank you for reaching out', 'Your message has been sent to AdaTheVA HealthTech Academy. We will be in touch soon.');
