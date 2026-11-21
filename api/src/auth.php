<?php
function startSession(): void {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']),
        'path' => '/',
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function currentUser(): ?array {
    if (empty($_SESSION['userId'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT id, nickname, email, role, credits, suspended FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['userId']]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function requireLogin(): array {
    $user = currentUser();
    if ($user === null) {
        fail('unauthenticated', 'Devi accedere per continuare.', 401);
    }
    if ($user['suspended']) {
        fail('suspended', 'Il tuo account è sospeso.', 403);
    }
    return $user;
}

function requireRole(string $role): array {
    $user = requireLogin();
    if ($user['role'] !== $role) {
        fail('forbidden', 'Non hai i permessi per questa azione.', 403);
    }
    return $user;
}

// Weekly top-up is computed lazily at login: one WEEKLY_TOPUP per full week elapsed.
function applyWeeklyTopup(int $userId): void {
    $stmt = db()->prepare(
        'UPDATE users
         SET credits = credits + ? * FLOOR(TIMESTAMPDIFF(DAY, lastTopupAt, NOW()) / 7),
             lastTopupAt = DATE_ADD(lastTopupAt, INTERVAL 7 * FLOOR(TIMESTAMPDIFF(DAY, lastTopupAt, NOW()) / 7) DAY)
         WHERE id = ? AND TIMESTAMPDIFF(DAY, lastTopupAt, NOW()) >= 7'
    );
    $stmt->execute([WEEKLY_TOPUP, $userId]);
}
