<?php

namespace App\Mail;

use App\Models\ReportSchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ScheduledReportMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ReportSchedule $schedule,
        public array $reportData,
        public array $attachmentPaths
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->getSubject(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.scheduled-report',
            with: [
                'scheduleName' => $this->schedule->name,
                'reportType' => $this->getReportTypeLabel(),
                'frequency' => ucfirst($this->schedule->frequency),
                'generatedAt' => now()->format('d/m/Y H:i'),
                'recordCount' => count($this->reportData),
                'summary' => $this->getSummary(),
            ]
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if (isset($this->attachmentPaths['pdf'])) {
            $attachments[] = Attachment::fromPath($this->attachmentPaths['pdf'])
                ->as("{$this->schedule->type}-report-" . now()->format('Y-m-d') . ".pdf")
                ->withMime('application/pdf');
        }

        if (isset($this->attachmentPaths['excel'])) {
            $attachments[] = Attachment::fromPath($this->attachmentPaths['excel'])
                ->as("{$this->schedule->type}-report-" . now()->format('Y-m-d') . ".xlsx")
                ->withMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }

        return $attachments;
    }

    private function getSubject(): string
    {
        $typeLabel = $this->getReportTypeLabel();
        $date = now()->format('d/m/Y');

        return "{$typeLabel} - {$this->schedule->name} ({$date})";
    }

    private function getReportTypeLabel(): string
    {
        return match($this->schedule->type) {
            'sales' => 'Sales Report',
            'products' => 'Products Report',
            'customers' => 'Customers Report',
            'profit' => 'Profit Report',
            'tax' => 'Tax Report',
            'inventory' => 'Inventory Report',
            default => 'Report'
        };
    }

    private function getSummary(): array
    {
        if (empty($this->reportData)) {
            return [];
        }

        switch ($this->schedule->type) {
            case 'sales':
                return [
                    'Total Transactions' => count($this->reportData),
                    'Total Revenue' => 'Rp ' . number_format(array_sum(array_column($this->reportData, 'total') ?? []), 0, ',', '.'),
                ];
            case 'products':
                return [
                    'Total Products' => count($this->reportData),
                    'Total Revenue' => 'Rp ' . number_format(array_sum(array_column($this->reportData, 'revenue') ?? []), 0, ',', '.'),
                ];
            case 'customers':
                return [
                    'Total Customers' => count($this->reportData),
                    'Total Spend' => 'Rp ' . number_format(array_sum(array_column($this->reportData, 'total_spend') ?? []), 0, ',', '.'),
                ];
            default:
                return [
                    'Total Records' => count($this->reportData),
                ];
        }
    }
}
