<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductsReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;
    protected $title;

    public function __construct($data, $title = 'Products Report')
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
        return [
            'Product Name',
            'SKU',
            'Category',
            'Stock',
            'Price',
            'Cost',
            'Profit Margin',
            'Units Sold',
            'Revenue',
            'Status',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function title(): string
    {
        return $this->title;
    }
}
