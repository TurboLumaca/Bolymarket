<?php
function getCsrf(): void {
    ok(['csrfToken' => $_SESSION['csrf']]);
}

function getMe(): void {
    ok(currentUser());
}

function register(): void {
    $body = jsonBody();
    $nickname = trim((string)($body['nickname'] ?? ''));
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');

    if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $nickname)) {
        fail('invalidNickname', 'Il nickname deve avere 3-20 caratteri: lettere, numeri o underscore.');
    }
    $domain = substr(strrchr($email, '@') ?: '', 1);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($domain, ALLOWED_EMAIL_DOMAINS, true)) {
        fail('invalidEmail', 'Usa la tua email universitaria (' . implode(', ', ALLOWED_EMAIL_DOMAINS) . ').');
    }
    if (strlen($password) < 8) {
        fail('weakPassword', 'La password deve avere almeno 8 caratteri.');
    }
    if (empty($body['consent'])) {
        fail('noConsent', 'Devi accettare l\'informativa sulla privacy.');
    }

    $stmt = db()->prepare('SELECT 1 FROM users WHERE nickname = ? OR email = ?');
    $stmt->execute([$nickname, $email]);
    if ($stmt->fetch()) {
        fail('duplicate', 'Nickname o email già registrati.', 409);
    }

    $stmt = db()->prepare(
        'INSERT INTO users (nickname, email, passwordHash, credits, lastTopupAt, consentAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())'
    );
    $stmt->execute([$nickname, $email, password_hash($password, PASSWORD_DEFAULT), STARTING_CREDITS]);

    session_regenerate_id(true);
    $_SESSION['userId'] = (int)db()->lastInsertId();
    ok(currentUser());
}

function login(): void {
    $body = jsonBody();
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');

    $stmt = db()->prepare('SELECT id, passwordHash, suspended FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($password, $row['passwordHash'])) {
        fail('badCredentials', 'Email o password errate.', 401);
    }
    if ($row['suspended']) {
        fail('suspended', 'Il tuo account è sospeso.', 403);
    }

    applyWeeklyTopup((int)$row['id']);
    session_regenerate_id(true);
    $_SESSION['userId'] = (int)$row['id'];
    ok(currentUser());
}

function logout(): void {
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    ok(['csrfToken' => $_SESSION['csrf']]);
}

// Foreign keys with ON DELETE CASCADE remove trades, positions, reports and history.
function deleteMe(): void {
    $user = requireLogin();
    $body = jsonBody();
    $stmt = db()->prepare('SELECT passwordHash, role FROM users WHERE id = ?');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!password_verify((string)($body['password'] ?? ''), $row['passwordHash'])) {
        fail('badCredentials', 'Password errata.', 401);
    }
    if ($row['role'] === 'gestore') {
        fail('forbidden', 'Il gestore non può eliminare il proprio account.', 403);
    }
    db()->prepare('DELETE FROM users WHERE id = ?')->execute([$user['id']]);
    logout();
}
