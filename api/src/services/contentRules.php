<?php
// Rejects text that matches any configured blocked pattern (names, exams, health, politics, leaks).
function checkBlockedContent(string ...$texts): void {
    $text = implode(' ', $texts);
    foreach (BLOCKED_PATTERNS as $pattern) {
        if (preg_match('/' . $pattern . '/iu', $text)) {
            fail('blockedContent', 'Il testo contiene un argomento non ammesso. Rileggi le regole sui contenuti.', 422);
        }
    }
}

function parseClosesAt(mixed $value): string {
    $time = is_string($value) ? strtotime($value) : false;
    if ($time === false || $time <= time() + 3600) {
        fail('invalidDate', 'La data di chiusura deve essere nel futuro.');
    }
    return date('Y-m-d H:i:s', $time);
}

function checkMarketText(array $body, array $categoryNames): array {
    $question = trim((string)($body['question'] ?? ''));
    $category = (string)($body['category'] ?? '');
    $rule = trim((string)($body['resolutionRule'] ?? ''));
    if (mb_strlen($question) < 15 || mb_strlen($question) > 200 || !str_ends_with($question, '?')) {
        fail('invalidQuestion', 'La domanda deve avere 15-200 caratteri e finire con un punto interrogativo.');
    }
    if (!in_array($category, $categoryNames, true)) {
        fail('invalidCategory', 'Scegli una categoria.');
    }
    if (mb_strlen($rule) < 30 || mb_strlen($rule) > 500) {
        fail('invalidRule', 'La regola deve avere 30-500 caratteri e indicare una fonte verificabile.');
    }
    checkBlockedContent($question, $rule);
    return [$question, $category, $rule];
}
