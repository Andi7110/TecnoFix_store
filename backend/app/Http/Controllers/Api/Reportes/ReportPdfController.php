<?php

namespace App\Http\Controllers\Api\Reportes;

use App\Http\Controllers\Controller;
use FPDF;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ReportPdfController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['daily', 'monthly', 'repair-daily', 'repair-monthly'])],
            'report' => ['required', 'array'],
        ]);

        $pdf = new FPDF();
        $pdf->SetTitle($this->text($this->titleFor($validated['type'])));
        $pdf->SetAuthor('Tecnofix');
        $pdf->SetMargins(12, 12, 12);
        $pdf->SetAutoPageBreak(true, 14);
        $pdf->AddPage();

        $this->renderReport($pdf, $validated['type'], $validated['report']);

        return response($pdf->Output('S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$this->filenameFor($validated['type']).'.pdf"',
        ]);
    }

    private function renderReport(FPDF $pdf, string $type, array $report): void
    {
        match ($type) {
            'monthly' => $this->renderMonthlySales($pdf, $report),
            'repair-daily' => $this->renderDailyRepairs($pdf, $report),
            'repair-monthly' => $this->renderMonthlyRepairs($pdf, $report),
            default => $this->renderDailySales($pdf, $report),
        };
    }

    private function renderHeader(FPDF $pdf, string $title, string $subtitle): void
    {
        $pdf->SetFillColor(15, 23, 42);
        $pdf->Rect(0, 0, 220, 25, 'F');
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->SetXY(12, 7);
        $pdf->Cell(0, 7, $this->text($title), 0, 1);
        $pdf->SetFont('Arial', '', 9);
        $pdf->SetX(12);
        $pdf->Cell(0, 5, $this->text($subtitle), 0, 1);
        $pdf->Ln(11);
        $pdf->SetTextColor(15, 23, 42);
    }

    private function renderMetrics(FPDF $pdf, array $metrics): void
    {
        $width = 45;
        $height = 18;
        $gap = 5;
        $index = 0;

        foreach ($metrics as [$label, $value]) {
            if ($index > 0 && $index % 4 === 0) {
                $pdf->Ln($height + 4);
            }

            $x = 12 + (($index % 4) * ($width + $gap));
            $y = $pdf->GetY();
            $pdf->SetXY($x, $y);
            $pdf->SetFillColor(248, 250, 252);
            $pdf->SetDrawColor(203, 213, 225);
            $pdf->Rect($x, $y, $width, $height, 'DF');
            $pdf->SetFont('Arial', '', 7);
            $pdf->SetTextColor(100, 116, 139);
            $pdf->SetXY($x + 3, $y + 3);
            $pdf->Cell($width - 6, 4, $this->text($label), 0, 1);
            $pdf->SetFont('Arial', 'B', 10);
            $pdf->SetTextColor(15, 23, 42);
            $pdf->SetX($x + 3);
            $pdf->Cell($width - 6, 6, $this->text($value), 0, 0);
            $index++;
        }

        $pdf->Ln($height + 8);
    }

    private function renderTable(FPDF $pdf, string $title, array $headers, array $rows, array $columns): void
    {
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->SetTextColor(15, 23, 42);
        $pdf->Cell(0, 7, $this->text($title), 0, 1);

        $availableWidth = 186;
        $columnWidth = $availableWidth / max(count($headers), 1);

        $pdf->SetFont('Arial', 'B', 8);
        $pdf->SetFillColor(226, 232, 240);
        $pdf->SetDrawColor(203, 213, 225);

        foreach ($headers as $header) {
            $pdf->Cell($columnWidth, 7, $this->text($header), 1, 0, 'L', true);
        }

        $pdf->Ln();
        $pdf->SetFont('Arial', '', 8);
        $pdf->SetFillColor(255, 255, 255);

        if (count($rows) === 0) {
            $pdf->Cell($availableWidth, 7, $this->text('Sin registros.'), 1, 1, 'C');
            $pdf->Ln(4);
            return;
        }

        foreach ($rows as $row) {
            foreach ($columns as $column) {
                $value = is_callable($column) ? $column($row) : data_get($row, $column);
                $pdf->Cell($columnWidth, 7, $this->text($value), 1);
            }

            $pdf->Ln();
        }

        $pdf->Ln(5);
    }

    private function renderDailySales(FPDF $pdf, array $report): void
    {
        $this->renderHeader($pdf, 'Reporte diario de ventas', $this->periodLine($report, 'Fecha: '.($report['fecha'] ?? '-')));
        $summary = $report['resumen'] ?? [];
        $cash = $report['caja'] ?? [];

        $this->renderMetrics($pdf, [
            ['Ventas netas', $this->money($summary['ventas_netas'] ?? 0)],
            ['Costo de ventas', $this->money($summary['costo_ventas'] ?? 0)],
            ['Utilidad bruta', $this->money($summary['utilidad_bruta'] ?? 0)],
            ['Margen bruto', $this->percent($summary['margen_bruto_porcentaje'] ?? 0)],
            ['Ventas del dia', $summary['ventas_count'] ?? 0],
            ['Items vendidos', $summary['items_vendidos'] ?? 0],
            ['Ticket promedio', $this->money($summary['ticket_promedio'] ?? 0)],
            ['Caja neta', $this->money($cash['neto'] ?? 0)],
        ]);

        $this->renderTable($pdf, 'Ventas por metodo', ['Metodo', 'Ventas', 'Total'], $report['ventas_por_metodo'] ?? [], [
            'metodo_pago',
            'ventas_count',
            fn ($row) => $this->money($row['total'] ?? 0),
        ]);
        $this->renderTable($pdf, 'Top productos', ['Producto', 'Cantidad', 'Total', 'Utilidad'], $report['top_productos'] ?? [], [
            fn ($row) => trim(($row['producto_nombre'] ?? '-').' '.(($row['producto_codigo'] ?? null) ? '('.$row['producto_codigo'].')' : '')),
            'cantidad',
            fn ($row) => $this->money($row['total'] ?? 0),
            fn ($row) => $this->money($row['utilidad_bruta'] ?? 0),
        ]);
    }

    private function renderMonthlySales(FPDF $pdf, array $report): void
    {
        $period = data_get($report, 'periodo.etiqueta', '-');
        $this->renderHeader($pdf, 'Estado de resultados mensual', $this->periodLine($report, 'Periodo: '.$period));
        $summary = $report['estado_resultados'] ?? [];

        $this->renderMetrics($pdf, [
            ['Ventas netas', $this->money($summary['ventas_netas'] ?? 0)],
            ['Otros ingresos', $this->money($summary['otros_ingresos'] ?? 0)],
            ['Ingresos operativos', $this->money($summary['ingresos_operativos'] ?? 0)],
            ['Costo de ventas', $this->money($summary['costo_ventas'] ?? 0)],
            ['Utilidad bruta', $this->money($summary['utilidad_bruta'] ?? 0)],
            ['Gastos operativos', $this->money($summary['gastos_operativos'] ?? 0)],
            ['Utilidad operativa', $this->money($summary['utilidad_operativa'] ?? 0)],
            ['Margen operativo', $this->percent($summary['margen_operativo_porcentaje'] ?? 0)],
        ]);

        $this->renderTable($pdf, 'Gastos operativos', ['Categoria', 'Mov.', 'Total'], $report['detalle_gastos_operativos'] ?? [], [
            'categoria_movimiento',
            'movimientos_count',
            fn ($row) => $this->money($row['total'] ?? 0),
        ]);
    }

    private function renderDailyRepairs(FPDF $pdf, array $report): void
    {
        $this->renderHeader($pdf, 'Reporte diario de reparaciones', $this->periodLine($report, 'Fecha: '.($report['fecha'] ?? '-')));
        $this->renderRepairSummary($pdf, $report);
        $this->renderRepairTables($pdf, $report);
    }

    private function renderMonthlyRepairs(FPDF $pdf, array $report): void
    {
        $period = data_get($report, 'periodo.etiqueta', '-');
        $this->renderHeader($pdf, 'Reporte mensual de reparaciones', $this->periodLine($report, 'Periodo: '.$period));
        $this->renderRepairSummary($pdf, $report);
        $this->renderTable($pdf, 'Utilidad por dia de entrega', ['Fecha', 'Entregadas', 'Valor', 'Utilidad'], $report['utilidad_entregas_por_dia'] ?? [], [
            'fecha',
            'entregadas',
            fn ($row) => $this->money($row['valor'] ?? 0),
            fn ($row) => $this->money($row['utilidad'] ?? 0),
        ]);
        $this->renderRepairTables($pdf, $report);
    }

    private function renderRepairSummary(FPDF $pdf, array $report): void
    {
        $summary = $report['resumen'] ?? [];

        $this->renderMetrics($pdf, [
            ['Ingresadas', $summary['ingresadas'] ?? 0],
            ['Entregadas', $summary['entregadas'] ?? 0],
            ['Valor entregado', $this->money($summary['valor_entregado'] ?? 0)],
            ['Costos', $this->money($summary['costos_entregadas'] ?? 0)],
            ['Utilidad', $this->money($summary['utilidad_entregadas'] ?? $summary['utilidad_reparaciones'] ?? 0)],
            ['Margen', $this->percent($summary['margen_utilidad_porcentaje'] ?? 0)],
            ['Ingresos caja', $this->money($summary['ingresos_caja'] ?? 0)],
            ['Flujo neto', $this->money($summary['utilidad_caja_periodo'] ?? 0)],
        ]);
    }

    private function renderRepairTables(FPDF $pdf, array $report): void
    {
        $this->renderTable($pdf, 'Costos por tipo', ['Tipo', 'Movimientos', 'Total'], $report['costos_por_tipo'] ?? [], [
            'tipo_costo',
            'movimientos',
            fn ($row) => $this->money($row['total'] ?? 0),
        ]);
    }

    private function periodLine(array $report, string $line): string
    {
        $module = data_get($report, 'modulo.nombre');

        return $module ? $line.' | Modulo: '.$module : $line;
    }

    private function titleFor(string $type): string
    {
        return match ($type) {
            'monthly' => 'Estado de resultados mensual',
            'repair-daily' => 'Reporte diario de reparaciones',
            'repair-monthly' => 'Reporte mensual de reparaciones',
            default => 'Reporte diario de ventas',
        };
    }

    private function filenameFor(string $type): string
    {
        return match ($type) {
            'monthly' => 'estado-resultados',
            'repair-daily' => 'reporte-diario-reparaciones',
            'repair-monthly' => 'reporte-mensual-reparaciones',
            default => 'reporte-diario-ventas',
        };
    }

    private function money(mixed $value): string
    {
        return '$'.number_format((float) $value, 2, '.', ',');
    }

    private function percent(mixed $value): string
    {
        return number_format((float) $value, 2, '.', ',').'%';
    }

    private function text(mixed $value): string
    {
        $encoded = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', (string) ($value ?? ''));

        return $encoded === false ? '' : $encoded;
    }
}
