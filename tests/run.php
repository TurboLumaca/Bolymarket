<?php
// Plain-assertion tests for the LMSR math. Run: php tests/run.php
require __DIR__ . '/../api/src/services/lmsr.php';

$failures = 0;
function check(string $name, bool $condition): void {
    global $failures;
    echo ($condition ? 'PASS' : 'FAIL') . "  $name\n";
    if (!$condition) {
        $failures++;
    }
}
function near(float $a, float $b, float $tolerance = 1e-9): bool {
    return abs($a - $b) <= $tolerance;
}

$b = 100.0;

check('price is 0.5 on a new market', near(priceYes(0, 0, $b), 0.5));

$sumOk = true;
foreach ([[0, 0], [30, 10], [250, 40], [5, 900], [-20, 60]] as [$qYes, $qNo]) {
    $sumOk = $sumOk && near(priceYes($qYes, $qNo, $b) + (1 - priceYes($qYes, $qNo, $b)), 1.0);
    // The No price is derived with the same formula with the sides swapped.
    $sumOk = $sumOk && near(priceYes($qYes, $qNo, $b) + priceYes($qNo, $qYes, $b), 1.0);
}
check('prices of Yes and No sum to 1', $sumOk);

$roundTripOk = true;
foreach (['yes', 'no'] as $side) {
    foreach ([[0, 0, 10], [40, 15, 75], [300, 20, 200]] as [$qYes, $qNo, $shares]) {
        $paid = costToBuy($qYes, $qNo, $b, $side, $shares);
        $afterYes = $side === 'yes' ? $qYes + $shares : $qYes;
        $afterNo = $side === 'no' ? $qNo + $shares : $qNo;
        $received = creditsFromSell($afterYes, $afterNo, $b, $side, $shares);
        $roundTripOk = $roundTripOk && near($paid, $received) && near(round($paid, 2), round($received, 2));
    }
}
check('buy followed by immediate sell returns the same credits', $roundTripOk);

check('first share costs about its price', near(costToBuy(0, 0, $b, 'yes', 1), 0.5, 0.01));
check('buying Yes raises the Yes price', priceYes(10, 0, $b) > 0.5);
check('large q values do not overflow', is_finite(cost(100000, 0, $b)) && near(priceYes(100000, 0, $b), 1.0));

// Maker loss: worst-case payout is max(qYes, qNo) credits, collected is cost(q) - cost(0).
mt_srand(7);
$maxLoss = 0.0;
foreach ([50.0, 100.0, 300.0] as $liquidity) {
    for ($run = 0; $run < 200; $run++) {
        $qYes = 0.0;
        $qNo = 0.0;
        for ($i = 0; $i < 60; $i++) {
            $side = mt_rand(0, 1) ? 'yes' : 'no';
            $shares = (float)mt_rand(1, 200);
            if (mt_rand(0, 3) === 0) {
                $held = $side === 'yes' ? $qYes : $qNo;
                $shares = min($shares, $held);
                if ($side === 'yes') { $qYes -= $shares; } else { $qNo -= $shares; }
            } elseif ($side === 'yes') {
                $qYes += $shares;
            } else {
                $qNo += $shares;
            }
            $loss = max($qYes, $qNo) - (cost($qYes, $qNo, $liquidity) - cost(0, 0, $liquidity));
            $maxLoss = max($maxLoss, $loss / ($liquidity * log(2)));
        }
    }
}
check('maker loss never exceeds b * ln(2)', $maxLoss <= 1.0 + 1e-9);

echo $failures === 0 ? "\nAll tests passed.\n" : "\n$failures test(s) failed.\n";
exit($failures === 0 ? 0 : 1);
