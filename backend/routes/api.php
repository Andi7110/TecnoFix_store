<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Inventario\CategoriaController;
use App\Http\Controllers\Api\Inventario\InventarioProductoController;
use App\Http\Controllers\Api\Inventario\ModuloController;
use App\Http\Controllers\Api\Inventario\MovimientoInventarioController;
use App\Http\Controllers\Api\Inventario\ProductoController;
use App\Http\Controllers\Api\Caja\MovimientoCajaController;
use App\Http\Controllers\Api\Dashboard\DashboardSummaryController;
use App\Http\Controllers\Api\Reparaciones\ReparacionController;
use App\Http\Controllers\Api\Ventas\CuentaTransferenciaController;
use App\Http\Controllers\Api\Ventas\SalesReportController;
use App\Http\Controllers\Api\Ventas\VentaController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->prefix('auth')->group(function (): void {
    Route::middleware(['guest', 'throttle:login'])->post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::middleware('auth:sanctum')->get('me', [AuthController::class, 'me'])->name('auth.me');
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout'])->name('auth.logout');
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('dashboard/resumen', DashboardSummaryController::class);

    Route::prefix('inventario')->group(function (): void {
        Route::apiResource('modulos', ModuloController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('categorias', CategoriaController::class)->only(['index', 'store', 'show', 'update']);
        Route::get('productos/inventario', [InventarioProductoController::class, 'index'])->name('productos.inventario.index');
        Route::get('productos/foto/{path}', [ProductoController::class, 'foto'])
            ->where('path', '.*')
            ->name('productos.foto');
        Route::patch('productos/{producto}/estado', [ProductoController::class, 'updateEstado'])->name('productos.update-estado');
        Route::apiResource('productos', ProductoController::class)->only(['index', 'store', 'show', 'update']);
        Route::apiResource('movimientos', MovimientoInventarioController::class)->only(['index', 'store', 'show']);
    });

    Route::prefix('ventas/reportes')->group(function (): void {
        Route::get('diario', [SalesReportController::class, 'daily'])->name('ventas.reportes.diario');
        Route::get('estado-resultados', [SalesReportController::class, 'monthlyIncomeStatement'])->name('ventas.reportes.estado-resultados');
        Route::post('diario', [SalesReportController::class, 'storeDaily'])->name('ventas.reportes.diario.store');
        Route::post('estado-resultados', [SalesReportController::class, 'storeMonthly'])->name('ventas.reportes.estado-resultados.store');
        Route::get('historial', [SalesReportController::class, 'history'])->name('ventas.reportes.historial');
    });

    Route::prefix('ventas')->group(function (): void {
        Route::apiResource('cuentas-transferencia', CuentaTransferenciaController::class)
            ->parameters(['cuentas-transferencia' => 'cuentaTransferencia'])
            ->only(['index', 'store', 'update', 'destroy']);
    });

    Route::apiResource('ventas', VentaController::class)->only(['index', 'store', 'show']);
    Route::patch('reparaciones/{reparacione}/estado', [ReparacionController::class, 'updateEstado'])->name('reparaciones.update-estado');
    Route::apiResource('reparaciones', ReparacionController::class)->only(['index', 'store', 'show', 'update']);
    Route::prefix('caja')->group(function (): void {
        Route::apiResource('movimientos', MovimientoCajaController::class)->only(['index', 'store', 'show']);
    });
});
