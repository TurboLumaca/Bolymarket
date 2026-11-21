<?php
// Logarithmic market scoring rule for a binary market. Pure math, no database.
// qYes, qNo: shares outstanding. b: liquidity (higher b = prices move more slowly).

function cost(float $qYes, float $qNo, float $b): float {
    // Subtracting the max keeps exp() from overflowing; the result is identical.
    $m = max($qYes, $qNo) / $b;
    return $b * ($m + log(exp($qYes / $b - $m) + exp($qNo / $b - $m)));
}

function priceYes(float $qYes, float $qNo, float $b): float {
    $m = max($qYes, $qNo) / $b;
    $yes = exp($qYes / $b - $m);
    return $yes / ($yes + exp($qNo / $b - $m));
}

// Credits the trader pays to buy $shares of $side ('yes' or 'no').
function costToBuy(float $qYes, float $qNo, float $b, string $side, float $shares): float {
    $afterYes = $side === 'yes' ? $qYes + $shares : $qYes;
    $afterNo = $side === 'no' ? $qNo + $shares : $qNo;
    return cost($afterYes, $afterNo, $b) - cost($qYes, $qNo, $b);
}

// Credits the trader receives when selling $shares of $side back to the market.
function creditsFromSell(float $qYes, float $qNo, float $b, string $side, float $shares): float {
    $afterYes = $side === 'yes' ? $qYes - $shares : $qYes;
    $afterNo = $side === 'no' ? $qNo - $shares : $qNo;
    return cost($qYes, $qNo, $b) - cost($afterYes, $afterNo, $b);
}
