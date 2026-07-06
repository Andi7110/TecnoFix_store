<?php

namespace App\Http\Controllers\Api\Reportes;

use App\Http\Controllers\Controller;
use FPDF;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DocumentPdfController extends Controller
{
    private const CODE39_PATTERNS = [
        '0' => 'nnnwwnwnn',
        '1' => 'wnnwnnnnw',
        '2' => 'nnwwnnnnw',
        '3' => 'wnwwnnnnn',
        '4' => 'nnnwwnnnw',
        '5' => 'wnnwwnnnn',
        '6' => 'nnwwwnnnn',
        '7' => 'nnnwnnwnw',
        '8' => 'wnnwnnwnn',
        '9' => 'nnwwnnwnn',
        'A' => 'wnnnnwnnw',
        'B' => 'nnwnnwnnw',
        'C' => 'wnwnnwnnn',
        'D' => 'nnnnwwnnw',
        'E' => 'wnnnwwnnn',
        'F' => 'nnwnwwnnn',
        'G' => 'nnnnnwwnw',
        'H' => 'wnnnnwwnn',
        'I' => 'nnwnnwwnn',
        'J' => 'nnnnwwwnn',
        'K' => 'wnnnnnnww',
        'L' => 'nnwnnnnww',
        'M' => 'wnwnnnnwn',
        'N' => 'nnnnwnnww',
        'O' => 'wnnnwnnwn',
        'P' => 'nnwnwnnwn',
        'Q' => 'nnnnnnwww',
        'R' => 'wnnnnnwwn',
        'S' => 'nnwnnnwwn',
        'T' => 'nnnnwnwwn',
        'U' => 'wwnnnnnnw',
        'V' => 'nwwnnnnnw',
        'W' => 'wwwnnnnnn',
        'X' => 'nwnnwnnnw',
        'Y' => 'wwnnwnnnn',
        'Z' => 'nwwnwnnnn',
        '-' => 'nwnnnnwnw',
        '.' => 'wwnnnnwnn',
        ' ' => 'nwwnnnwnn',
        '$' => 'nwnwnwnnn',
        '/' => 'nwnwnnnwn',
        '+' => 'nwnnnwnwn',
        '%' => 'nnnwnwnwn',
        '*' => 'nwnnwnwnn',
    ];

    public function barcodes(Request $request): Response
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable'],
            'items.*.codigo' => ['required', 'string', 'max:80'],
            'items.*.nombre' => ['nullable', 'string', 'max:160'],
            'items.*.precio_venta' => ['nullable', 'numeric'],
            'items.*.quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        $labels = $this->normalizeBarcodeItems($validated['items']);

        abort_if(count($labels) === 0, 422, 'Selecciona al menos una etiqueta para imprimir.');

        $pdf = new FPDF('P', 'mm', 'A4');
        $pdf->SetTitle($this->text('Etiquetas de codigo de barras'));
        $pdf->SetMargins(8, 8, 8);
        $pdf->SetAutoPageBreak(false);
        $pdf->AddPage();

        $this->renderBarcodeLabels($pdf, $labels);

        return $this->pdfResponse($pdf, 'etiquetas-codigos.pdf');
    }

    public function ticket(Request $request): Response
    {
        $validated = $request->validate([
            'venta' => ['required', 'array'],
            'ticketConfig' => ['nullable', 'array'],
        ]);

        $venta = $validated['venta'];
        $ticketConfig = array_merge([
            'businessName' => 'TecnoFix',
            'businessPhone' => '',
            'businessAddress' => '',
            'footerNote' => 'Gracias por su compra en Tecnofix',
        ], $validated['ticketConfig'] ?? []);

        $pdf = new FPDF('P', 'mm', [80, 220]);
        $pdf->SetTitle($this->text('Ticket '.($venta['numero_venta'] ?? 'TecnoFix')));
        $pdf->SetMargins(5, 6, 5);
        $pdf->SetAutoPageBreak(true, 8);
        $pdf->AddPage();

        $this->renderTicket($pdf, $venta, $ticketConfig);

        return $this->pdfResponse($pdf, 'ticket-venta.pdf');
    }

    private function normalizeBarcodeItems(array $items): array
    {
        $labels = [];

        foreach ($items as $item) {
            $quantity = max(0, (int) ($item['quantity'] ?? 0));

            if ($quantity === 0) {
                continue;
            }

            $codigo = $this->sanitizeCode39($item['codigo'] ?? '');

            for ($index = 0; $index < $quantity; $index++) {
                $labels[] = [
                    'codigo' => $codigo,
                    'nombre' => $item['nombre'] ?? 'Producto',
                    'precio' => $item['precio_venta'] ?? 0,
                ];
            }
        }

        return $labels;
    }

    private function renderBarcodeLabels(FPDF $pdf, array $labels): void
    {
        $marginX = 8;
        $marginY = 8;
        $gapX = 5;
        $gapY = 5;
        $labelWidth = 61;
        $labelHeight = 34;

        foreach ($labels as $index => $label) {
            $column = $index % 3;
            $row = intdiv($index % 24, 3);

            if ($index > 0 && $index % 24 === 0) {
                $pdf->AddPage();
                $row = 0;
            }

            $x = $marginX + ($column * ($labelWidth + $gapX));
            $y = $marginY + ($row * ($labelHeight + $gapY));

            $pdf->SetDrawColor(209, 213, 219);
            $pdf->Rect($x, $y, $labelWidth, $labelHeight);
            $pdf->SetTextColor(17, 24, 39);
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->SetXY($x + 3, $y + 3);
            $pdf->MultiCell($labelWidth - 6, 4, $this->text($label['nombre']), 0, 'L');

            $this->drawCode39($pdf, $label['codigo'], $x + 4, $y + 13, $labelWidth - 8, 12);

            $pdf->SetFont('Arial', '', 8);
            $pdf->SetXY($x + 3, $y + 28);
            $pdf->Cell(($labelWidth - 6) / 2, 4, $this->text($label['codigo']), 0, 0, 'L');
            $pdf->SetFont('Arial', 'B', 8);
            $pdf->Cell(($labelWidth - 6) / 2, 4, $this->text($this->money($label['precio'])), 0, 0, 'R');
        }
    }

    private function renderTicket(FPDF $pdf, array $venta, array $ticketConfig): void
    {
        $details = $venta['detalles'] ?? [];

        $pdf->SetTextColor(17, 17, 17);
        $pdf->SetFont('Arial', 'B', 18);
        $pdf->MultiCell(70, 7, $this->text($ticketConfig['businessName'] ?: 'TecnoFix'), 0, 'C');
        $pdf->SetFont('Arial', '', 8);

        if (!empty($ticketConfig['businessAddress'])) {
            $pdf->MultiCell(70, 4, $this->text($ticketConfig['businessAddress']), 0, 'C');
        }

        if (!empty($ticketConfig['businessPhone'])) {
            $pdf->Cell(70, 4, $this->text('Tel: '.$ticketConfig['businessPhone']), 0, 1, 'C');
        }

        $pdf->Ln(3);
        $this->ticketDivider($pdf);
        $pdf->SetFont('Arial', '', 8);
        $pdf->Cell(70, 5, $this->text('Fecha: '.$this->formatDate($venta['fecha_venta'] ?? null)), 0, 1);
        $this->ticketDivider($pdf);

        $pdf->SetFont('Arial', 'B', 8);
        $pdf->Cell(38, 5, $this->text('Descripcion'), 0, 0);
        $pdf->Cell(10, 5, $this->text('Cant.'), 0, 0, 'C');
        $pdf->Cell(22, 5, $this->text('Total'), 0, 1, 'R');
        $this->ticketDivider($pdf, '-');

        $pdf->SetFont('Arial', '', 8);
        foreach ($details as $detail) {
            $name = data_get($detail, 'producto.nombre') ?? ($detail['descripcion_item'] ?? 'Articulo');
            $y = $pdf->GetY();
            $pdf->MultiCell(38, 4, $this->text($name), 0, 'L');
            $nextY = $pdf->GetY();
            $pdf->SetXY(43, $y);
            $pdf->Cell(10, 4, $this->text($detail['cantidad'] ?? 0), 0, 0, 'C');
            $pdf->Cell(22, 4, $this->text($this->money($detail['subtotal'] ?? 0)), 0, 1, 'R');
            $pdf->SetY(max($nextY, $pdf->GetY()) + 1);
        }

        $this->ticketDivider($pdf);
        $this->ticketTotalLine($pdf, 'Subtotal:', $venta['subtotal'] ?? 0);

        if ((float) ($venta['descuento'] ?? 0) > 0) {
            $this->ticketTotalLine($pdf, 'Descuento:', $venta['descuento'] ?? 0);
        }

        $pdf->SetFont('Arial', 'B', 9);
        $this->ticketTotalLine($pdf, 'Total:', $venta['total'] ?? 0);
        $pdf->Ln(2);
        $this->ticketDivider($pdf);
        $pdf->SetFont('Arial', '', 8);
        $pdf->Cell(38, 5, $this->text('Forma de pago:'), 0, 0);
        $pdf->Cell(32, 5, $this->text($this->formatPaymentMethod($venta['metodo_pago'] ?? '-')), 0, 1, 'R');
        $pdf->Ln(10);
        $pdf->SetFont('Arial', 'B', 8);
        $pdf->MultiCell(70, 4, $this->text($ticketConfig['footerNote'] ?: 'Gracias por su compra en Tecnofix'), 0, 'C');
    }

    private function drawCode39(FPDF $pdf, string $value, float $x, float $y, float $targetWidth, float $height): void
    {
        $encoded = '*'.$value.'*';
        $narrowUnits = 0;

        foreach (str_split($encoded) as $char) {
            $pattern = self::CODE39_PATTERNS[$char] ?? null;
            abort_if($pattern === null, 422, 'Codigo no compatible con Code 39.');

            foreach (str_split($pattern) as $bar) {
                $narrowUnits += $bar === 'w' ? 2.5 : 1;
            }

            $narrowUnits += 1;
        }

        $unit = $targetWidth / max($narrowUnits, 1);
        $currentX = $x;
        $pdf->SetFillColor(17, 17, 17);

        foreach (str_split($encoded) as $char) {
            $pattern = self::CODE39_PATTERNS[$char];

            foreach (str_split($pattern) as $index => $bar) {
                $width = $unit * ($bar === 'w' ? 2.5 : 1);

                if ($index % 2 === 0) {
                    $pdf->Rect($currentX, $y, $width, $height, 'F');
                }

                $currentX += $width;
            }

            $currentX += $unit;
        }
    }

    private function sanitizeCode39(string $value): string
    {
        $normalized = strtoupper(trim($value));
        abort_if($normalized === '', 422, 'El producto no tiene codigo para generar el codigo de barra.');
        abort_unless((bool) preg_match('/^[0-9A-Z.\- $\/+%]+$/', $normalized), 422, 'El codigo contiene caracteres no compatibles con Code 39.');

        return $normalized;
    }

    private function ticketDivider(FPDF $pdf, string $char = '='): void
    {
        $pdf->SetFont('Arial', '', 7);
        $pdf->Cell(70, 3, str_repeat($char, 55), 0, 1, 'C');
    }

    private function ticketTotalLine(FPDF $pdf, string $label, mixed $value): void
    {
        $pdf->Cell(45, 5, $this->text($label), 0, 0, 'R');
        $pdf->Cell(25, 5, $this->text($this->money($value)), 0, 1, 'R');
    }

    private function formatDate(mixed $value): string
    {
        if (!$value) {
            return '-';
        }

        $timestamp = strtotime((string) $value);

        return $timestamp ? date('d/m/Y', $timestamp) : '-';
    }

    private function formatPaymentMethod(mixed $value): string
    {
        return ucwords(str_replace('_', ' ', (string) ($value ?? '-')));
    }

    private function money(mixed $value): string
    {
        return '$'.number_format((float) $value, 2, '.', ',');
    }

    private function pdfResponse(FPDF $pdf, string $filename): Response
    {
        return response($pdf->Output('S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    private function text(mixed $value): string
    {
        $encoded = iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', (string) ($value ?? ''));

        return $encoded === false ? '' : $encoded;
    }
}
