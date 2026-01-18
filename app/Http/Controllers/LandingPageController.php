<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function index()
    {
        return Inertia::render('Landing/Index', [
            'features' => $this->getFeatures(),
            'pricing' => $this->getPricing(),
            'testimonials' => $this->getTestimonials(),
            'stats' => $this->getStats(),
        ]);
    }

    private function getFeatures()
    {
        return [
            [
                'icon' => 'cloud',
                'title' => 'Sinkron Otomatis Multi-Toko',
                'description' => 'Kelola puluhan toko sekaligus dengan data yang selalu tersinkronisasi real-time. Tidak perlu ribet cek satu per satu.',
                'color' => 'blue',
            ],
            [
                'icon' => 'chart',
                'title' => 'Laporan Lengkap & Real-Time',
                'description' => 'Dashboard analytics yang powerful. Lihat performa semua cabang, produk terlaris, hingga profit margin dalam hitungan detik.',
                'color' => 'green',
            ],
            [
                'icon' => 'mobile',
                'title' => 'Akses dari Mana Saja',
                'description' => 'Pantau bisnis Anda kapan saja, dimana saja. Cukup dari smartphone, tablet, atau laptop dengan koneksi internet.',
                'color' => 'purple',
            ],
            [
                'icon' => 'shield',
                'title' => 'Data Aman & Backup Otomatis',
                'description' => 'Data bisnis Anda tersimpan aman di cloud dengan enkripsi tingkat enterprise. Backup otomatis setiap hari.',
                'color' => 'red',
            ],
            [
                'icon' => 'users',
                'title' => 'Multi-User & Role Management',
                'description' => 'Atur hak akses untuk kasir, admin, hingga owner. Setiap orang punya akses sesuai tugasnya.',
                'color' => 'orange',
            ],
            [
                'icon' => 'wallet',
                'title' => 'Integrasi Payment Gateway',
                'description' => 'Terima pembayaran dari QRIS, GoPay, OVO, Dana, ShopeePay, dan kartu kredit. Semua terintegrasi dalam satu sistem.',
                'color' => 'indigo',
            ],
        ];
    }

    private function getPricing()
    {
        return [
            [
                'name' => 'Starter',
                'price' => 99000,
                'period' => 'bulan',
                'description' => 'Cocok untuk bisnis pemula',
                'features' => [
                    '1 Toko/Cabang',
                    '100 Produk',
                    '1.000 Transaksi/bulan',
                    'Laporan Basic',
                    '2 User/Kasir',
                    'Support via Email',
                ],
                'popular' => false,
            ],
            [
                'name' => 'Business',
                'price' => 299000,
                'period' => 'bulan',
                'description' => 'Paling populer untuk UMKM',
                'features' => [
                    '5 Toko/Cabang',
                    'Unlimited Produk',
                    '10.000 Transaksi/bulan',
                    'Laporan Advanced + Export',
                    '10 User/Kasir',
                    'Integrasi Payment Gateway',
                    'Support via WhatsApp',
                    'Training Online',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Enterprise',
                'price' => 999000,
                'period' => 'bulan',
                'description' => 'Untuk bisnis skala besar',
                'features' => [
                    'Unlimited Toko/Cabang',
                    'Unlimited Produk',
                    'Unlimited Transaksi',
                    'Laporan Custom + BI Dashboard',
                    'Unlimited User',
                    'Semua Integrasi',
                    'Priority Support 24/7',
                    'Dedicated Account Manager',
                    'Custom Development',
                    'API Access',
                ],
                'popular' => false,
            ],
        ];
    }

    private function getTestimonials()
    {
        return [
            [
                'name' => 'Budi Santoso',
                'role' => 'Owner Warung Kopi Sejahtera',
                'location' => 'Jakarta',
                'avatar' => 'BS',
                'rating' => 5,
                'comment' => 'TokoSync benar-benar membantu bisnis saya berkembang. Dari 1 outlet jadi 5 outlet dalam 6 bulan. Semua data terpantau real-time!',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'role' => 'Owner Fashion Store "Cantik"',
                'location' => 'Bandung',
                'avatar' => 'SN',
                'rating' => 5,
                'comment' => 'Sebelum pakai TokoSync, saya harus bolak-balik ke toko untuk cek stok. Sekarang tinggal buka HP, semua sudah jelas. Recommended!',
            ],
            [
                'name' => 'Ahmad Hidayat',
                'role' => 'Franchise Manager Ayam Geprek',
                'location' => 'Surabaya',
                'avatar' => 'AH',
                'rating' => 5,
                'comment' => 'Manage 15 cabang jadi mudah dengan TokoSync. Laporan penjualan, stok, sampai profit semua cabang bisa saya lihat dalam 1 dashboard.',
            ],
        ];
    }

    private function getStats()
    {
        return [
            [
                'value' => '2,500+',
                'label' => 'Bisnis Bergabung',
            ],
            [
                'value' => '10,000+',
                'label' => 'Toko Terhubung',
            ],
            [
                'value' => '50M+',
                'label' => 'Transaksi Diproses',
            ],
            [
                'value' => '99.9%',
                'label' => 'Uptime Server',
            ],
        ];
    }
}
