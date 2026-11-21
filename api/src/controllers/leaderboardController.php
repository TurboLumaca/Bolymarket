<?php
function getLeaderboard(): void {
    resolveMarketStatus();
    if (($_GET['tab'] ?? 'credits') === 'brier') {
        ok(['tab' => 'brier', 'minResolved' => MIN_RESOLVED_FOR_RANKING, 'rows' => leaderboardBrier()]);
    }
    ok(['tab' => 'credits', 'rows' => leaderboardCredits()]);
}
