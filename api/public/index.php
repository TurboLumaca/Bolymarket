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

    ['GET',    '/api/categories',            'getCategories'],
    ['GET',    '/api/markets',               'getMarkets'],
    ['GET',    '/api/markets/{id}',          'getMarket'],
    ['POST',   '/api/markets/{id}/preview',  'postPreview'],
    ['POST',   '/api/markets/{id}/trades',   'postTrade'],
    ['POST',   '/api/markets/{id}/reports',  'postReport'],
    ['GET',    '/api/portfolio',             'getPortfolio'],
    ['GET',    '/api/leaderboard',           'getLeaderboard'],
    ['POST',   '/api/proposals',             'postProposal'],
    ['GET',    '/api/proposals/mine',        'getMyProposals'],

    ['GET',    '/api/admin/markets',                  'adminMarkets'],
    ['POST',   '/api/admin/markets/{id}/approve',     'approveMarket'],
    ['POST',   '/api/admin/markets/{id}/reject',      'rejectMarket'],
    ['POST',   '/api/admin/markets/{id}/resolve',     'resolveMarket'],
    ['POST',   '/api/admin/markets/{id}/void',        'voidMarket'],
    ['POST',   '/api/admin/markets/{id}/hide',        'hideMarket'],
    ['GET',    '/api/admin/dashboard',                'adminDashboard'],
    ['GET',    '/api/admin/reports',                  'adminReports'],
    ['POST',   '/api/admin/reports/{id}/close',       'closeReport'],
    ['GET',    '/api/admin/users',                    'adminUsers'],
    ['POST',   '/api/admin/users/{id}/suspend',       'suspendUser'],
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
