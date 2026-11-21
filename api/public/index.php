<?php
require __DIR__ . '/../src/config.php';
require __DIR__ . '/../src/db.php';
require __DIR__ . '/../src/http.php';
require __DIR__ . '/../src/auth.php';
foreach (glob(__DIR__ . '/../src/services/*.php') as $file) {
    require $file;
}
foreach (glob(__DIR__ . '/../src/controllers/*.php') as $file) {
    require $file;
}

// method, path pattern, handler. {id} matches a number.
$routes = [
    ['GET',    '/api/csrf',          'getCsrf'],
    ['GET',    '/api/me',            'getMe'],
    ['DELETE', '/api/me',            'deleteMe'],
    ['POST',   '/api/auth/register', 'register'],
    ['POST',   '/api/auth/login',    'login'],
    ['POST',   '/api/auth/logout',   'logout'],
];

function dispatch(array $routes): void {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $found = false;
    foreach ($routes as [$routeMethod, $pattern, $handler]) {
        $regex = '#^' . str_replace('{id}', '(\d+)', $pattern) . '$#';
        if (preg_match($regex, $path, $matches)) {
            $found = true;
            if ($routeMethod === $method) {
                if ($method !== 'GET') {
                    requireCsrf();
                }
                $handler(...array_map('intval', array_slice($matches, 1)));
                return;
            }
        }
    }
    if ($found) {
        fail('methodNotAllowed', 'Metodo non consentito.', 405);
    }
    fail('notFound', 'Risorsa non trovata.', 404);
}

try {
    startSession();
    dispatch($routes);
} catch (ApiError $e) {
    sendJson(null, ['code' => $e->errorCode, 'message' => $e->getMessage()], $e->status);
} catch (Throwable $e) {
    error_log($e);
    sendJson(null, ['code' => 'server', 'message' => 'Errore interno del server.'], 500);
}
