<?php
// All tunable values live here.
const STARTING_CREDITS = 1000;
const WEEKLY_TOPUP = 100;
const LIQUIDITY_DEFAULT = 100;
const MIN_TRADE = 1;
const MAX_TRADE = 200;
const MIN_RESOLVED_FOR_RANKING = 5;
const ALLOWED_EMAIL_DOMAINS = ['studio.unibo.it', 'unibo.it'];

// Case-insensitive regex fragments matched against question and resolution rule.
const BLOCKED_PATTERNS = [
    '\\besam[ei]\\b', '\\bvoti?\\b', 'bocciat', 'promoss', 'prof\\.', 'professor', 'docent',
    'malatt', 'covid', 'incinta', 'depress',
    'elezion', '\\bpartit[oi]\\b', 'candidat', '\\bpd\\b', '\\blega\\b',
    'soffiata', 'anticipazion', 'insider',
];

const DB_HOST = '127.0.0.1';
const DB_PORT = 8889; // 3306 on XAMPP, 8889 on MAMP
const DB_NAME = 'bolymarket';
const DB_USER = 'bolymarket';
const DB_PASS = 'bolymarket';
