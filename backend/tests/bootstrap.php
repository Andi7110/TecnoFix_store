<?php

require dirname(__DIR__).'/vendor/autoload.php';

$connection = getenv('DB_CONNECTION') ?: '';
$database = getenv('DB_DATABASE') ?: '';

if ($connection !== 'mysql' || ! preg_match('/^tecnofix_test_[0-9]{8}_[0-9]{6}_[a-f0-9]{6}$/', $database)) {
    throw new RuntimeException(
        'TecnoFix integration tests require an automatically managed disposable MySQL database. '
        .'Run composer test or composer test:mysql instead of invoking PHPUnit directly.',
    );
}
