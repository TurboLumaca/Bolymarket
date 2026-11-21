<?php
class ApiError extends Exception {
    public function __construct(public string $errorCode, string $message, public int $status = 400) {
        parent::__construct($message);
    }
}

function sendJson(mixed $data, ?array $error, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['data' => $data, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function ok(mixed $data = null): never {
    sendJson($data, null);
}

function fail(string $code, string $message, int $status = 400): never {
    throw new ApiError($code, $message, $status);
}

function jsonBody(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        fail('badJson', 'Corpo della richiesta non valido.');
    }
    return $body;
}

function requireCsrf(): void {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf'] ?? '';
    if ($expected === '' || !hash_equals($expected, $sent)) {
        fail('csrf', 'Token di sicurezza non valido. Ricarica la pagina.', 403);
    }
}
