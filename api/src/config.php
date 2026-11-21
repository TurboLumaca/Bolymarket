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
    'esame', 'voto', 'bocciat', 'promoss', 'prof\.', 'professor',
    'malatt', 'covid', 'incinta', 'depress',
    'elezion', 'partito', 'candidat', 'pd\b', 'lega\b',
    'soffiata', 'anticipazion', 'insider',
];

const DB_HOST = '127.0.0.1';
const DB_NAME = 'oracolo';
const DB_USER = 'oracolo';
const DB_PASS = 'oracolo';
