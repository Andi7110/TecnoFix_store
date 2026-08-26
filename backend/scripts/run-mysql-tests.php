<?php

use Illuminate\Contracts\Console\Kernel;

require dirname(__DIR__).'/vendor/autoload.php';

$root = dirname(__DIR__);
$app = require $root.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$mysql = config('database.connections.mysql');
$host = $mysql['host'] ?? '127.0.0.1';
$port = $mysql['port'] ?? '3306';
$charset = $mysql['charset'] ?? 'utf8mb4';
$socket = $mysql['unix_socket'] ?? '';

if ($socket === '' && ! in_array($host, ['127.0.0.1', 'localhost', '::1'], true)) {
    throw new RuntimeException('The disposable test runner only permits a local MySQL server.');
}

$dsn = $socket !== ''
    ? "mysql:unix_socket={$socket};charset={$charset}"
    : "mysql:host={$host};port={$port};charset={$charset}";
$options = $mysql['options'] ?? [];

$server = new PDO(
    $dsn,
    $mysql['username'] ?? null,
    $mysql['password'] ?? null,
    $options,
);
$server->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$database = 'tecnofix_test_'.date('Ymd_His').'_'.bin2hex(random_bytes(3));

if (! preg_match('/^tecnofix_test_[0-9]{8}_[0-9]{6}_[a-f0-9]{6}$/', $database)) {
    throw new RuntimeException('Generated test database name was rejected.');
}

$exists = $server->prepare('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?');
$exists->execute([$database]);

if ($exists->fetchColumn() !== false) {
    throw new RuntimeException('Generated test database already exists; refusing to reuse it.');
}

$server->exec("CREATE DATABASE `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

putenv('APP_ENV=testing');
putenv('DB_CONNECTION=mysql');
putenv("DB_DATABASE={$database}");
$_ENV['APP_ENV'] = $_SERVER['APP_ENV'] = 'testing';
$_ENV['DB_CONNECTION'] = $_SERVER['DB_CONNECTION'] = 'mysql';
$_ENV['DB_DATABASE'] = $_SERVER['DB_DATABASE'] = $database;

$artisan = escapeshellarg(PHP_BINARY).' '.escapeshellarg($root.'/artisan');

$run = static function (string $arguments) use ($artisan): void {
    passthru("{$artisan} {$arguments}", $exitCode);

    if ($exitCode !== 0) {
        throw new RuntimeException("Command failed with exit code {$exitCode}: artisan {$arguments}");
    }
};

try {
    echo "Using disposable MySQL database: {$database}", PHP_EOL;
    $run('migrate:fresh --seed --force');
    $run('migrate:status');

    $testDatabase = new PDO(
        $dsn.";dbname={$database}",
        $mysql['username'] ?? null,
        $mysql['password'] ?? null,
        $options,
    );
    $testDatabase->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sentinel = '__migration_preserves_existing_data__';
    $insert = $testDatabase->prepare(
        'INSERT INTO modulos (nombre, descripcion, estado, created_at, updated_at) '
        .'VALUES (?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
    );
    $insert->execute([$sentinel, 'Disposable migration compatibility check']);

    $baseMigrations = [
        '2026_03_24_100000_create_modulos_table',
        '2026_03_24_101000_create_categorias_table',
        '2026_03_24_102000_create_clientes_table',
        '2026_03_24_103000_create_productos_table',
        '2026_03_24_104000_create_ventas_table',
        '2026_03_24_105000_create_detalle_ventas_table',
        '2026_03_24_106000_create_reparaciones_table',
        '2026_03_24_107000_create_historial_reparaciones_table',
        '2026_03_24_108000_create_movimientos_inventario_table',
        '2026_03_24_109000_create_movimientos_caja_table',
        '2026_03_24_110000_create_costos_fijos_table',
        '2026_03_24_111000_create_registro_costos_fijos_table',
    ];
    $placeholders = implode(',', array_fill(0, count($baseMigrations), '?'));
    $deleteMigrations = $testDatabase->prepare("DELETE FROM migrations WHERE migration IN ({$placeholders})");
    $deleteMigrations->execute($baseMigrations);

    $run('migrate --force');

    $checkSentinel = $testDatabase->prepare('SELECT COUNT(*) FROM modulos WHERE nombre = ?');
    $checkSentinel->execute([$sentinel]);

    if ((int) $checkSentinel->fetchColumn() !== 1) {
        throw new RuntimeException('Existing-data migration check failed.');
    }

    $testDatabase->prepare('DELETE FROM modulos WHERE nombre = ?')->execute([$sentinel]);
    echo 'Existing database migration check preserved its sentinel row.', PHP_EOL;

    $testArguments = array_map('escapeshellarg', array_slice($argv, 1));
    $run(trim('test '.implode(' ', $testArguments)));
} finally {
    if (preg_match('/^tecnofix_test_[0-9]{8}_[0-9]{6}_[a-f0-9]{6}$/', $database)) {
        $server->exec("DROP DATABASE IF EXISTS `{$database}`");
        echo "Removed disposable MySQL database: {$database}", PHP_EOL;
    }
}
