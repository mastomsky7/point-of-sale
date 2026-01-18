<?php

namespace App\Console\Commands;

use App\Mail\ScheduledReportMail;
use App\Models\ReportSchedule;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class SendScheduledReports extends Command
{
    protected $signature = 'reports:send-scheduled';
    protected $description = 'Send scheduled reports via email';

    public function handle()
    {
        $this->info('Checking for scheduled reports...');

        $dueSchedules = ReportSchedule::active()
            ->due()
            ->with(['user'])
            ->get();

        if ($dueSchedules->isEmpty()) {
            $this->info('No reports due for sending.');
            return 0;
        }

        $this->info("Found {$dueSchedules->count()} report(s) to send.");

        foreach ($dueSchedules as $schedule) {
            try {
                $this->info("Processing: {$schedule->name}");

                $reportData = $this->generateReportData($schedule);
                $attachments = $this->generateAttachments($schedule, $reportData);

                Mail::to($schedule->recipients)->send(
                    new ScheduledReportMail($schedule, $reportData, $attachments)
                );

                $schedule->markAsSent();

                $this->info("✓ Sent: {$schedule->name}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send {$schedule->name}: {$e->getMessage()}");
            }
        }

        $this->info('Scheduled reports processing completed.');
        return 0;
    }

    private function generateReportData(ReportSchedule $schedule): array
    {
        $filters = $schedule->filters ?? [];
        $controller = app("App\\Http\\Controllers\\Apps\\ReportExportController");

        switch ($schedule->type) {
            case 'sales':
                return $controller->getSalesDataPublic($filters);
            case 'products':
                return $controller->getProductsDataPublic($filters);
            case 'customers':
                return $controller->getCustomersDataPublic($filters);
            case 'profit':
                return $controller->getProfitDataPublic($filters);
            case 'tax':
                return $controller->getTaxDataPublic($filters);
            case 'inventory':
                return $controller->getInventoryDataPublic($filters);
            default:
                return [];
        }
    }

    private function generateAttachments(ReportSchedule $schedule, array $data): array
    {
        $attachments = [];
        $timestamp = now()->format('Y-m-d-His');

        if (in_array($schedule->format, ['pdf', 'both'])) {
            $pdf = $this->generatePDF($schedule, $data);
            $pdfPath = storage_path("app/reports/{$schedule->type}-{$timestamp}.pdf");
            $pdf->save($pdfPath);
            $attachments['pdf'] = $pdfPath;
        }

        if (in_array($schedule->format, ['excel', 'both'])) {
            $excelPath = storage_path("app/reports/{$schedule->type}-{$timestamp}.xlsx");
            $this->generateExcel($schedule, $data, $excelPath);
            $attachments['excel'] = $excelPath;
        }

        return $attachments;
    }

    private function generatePDF(ReportSchedule $schedule, array $data)
    {
        $viewMap = [
            'sales' => 'reports.sales-pdf',
            'products' => 'reports.products-pdf',
            'customers' => 'reports.customers-pdf',
            'profit' => 'reports.profit-pdf',
            'tax' => 'reports.tax-pdf',
            'inventory' => 'reports.inventory-pdf',
        ];

        $view = $viewMap[$schedule->type] ?? 'reports.sales-pdf';

        return Pdf::loadView($view, [
            'data' => $data,
            'title' => $schedule->name,
            'period' => $this->getPeriodLabel($schedule),
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');
    }

    private function generateExcel(ReportSchedule $schedule, array $data, string $path)
    {
        $exportClass = "App\\Exports\\" . ucfirst($schedule->type) . "ReportExport";

        if (class_exists($exportClass)) {
            Excel::store(new $exportClass($data, $schedule->name), basename($path), 'local');
        } else {
            $this->generateInlineExcel($schedule, $data, $path);
        }
    }

    private function generateInlineExcel(ReportSchedule $schedule, array $data, string $path)
    {
        Excel::store(new class($data, $schedule->name) implements
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings,
            \Maatwebsite\Excel\Concerns\WithTitle
        {
            private $data;
            private $title;

            public function __construct($data, $title)
            {
                $this->data = $data;
                $this->title = $title;
            }

            public function collection()
            {
                return collect($this->data);
            }

            public function headings(): array
            {
                return array_keys($this->data[0] ?? []);
            }

            public function title(): string
            {
                return $this->title;
            }
        }, basename($path), 'local');
    }

    private function getPeriodLabel(ReportSchedule $schedule): string
    {
        $filters = $schedule->filters ?? [];

        if (isset($filters['date_from']) && isset($filters['date_to'])) {
            return "{$filters['date_from']} to {$filters['date_to']}";
        }

        return match($schedule->frequency) {
            'daily' => 'Today',
            'weekly' => 'Last 7 Days',
            'monthly' => 'This Month',
            'quarterly' => 'This Quarter',
            'yearly' => 'This Year',
            default => 'Custom Period'
        };
    }
}
