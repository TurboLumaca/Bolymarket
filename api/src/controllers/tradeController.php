<?php
function postPreview(int $marketId): void {
    requireLogin();
    ok(previewTrade($marketId, jsonBody()));
}

function postTrade(int $marketId): void {
    $user = requireLogin();
    ok(executeTrade((int)$user['id'], $marketId, jsonBody()));
}
