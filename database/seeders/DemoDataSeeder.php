<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Service;
use App\Models\Staff;
use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Business Settings
        BusinessSetting::updateOrCreate(
            ['id' => 1],
            [
                'business_name' => 'POS System Demo',
                'business_type' => 'beauty_salon', // Support both retail & beauty salon
                'business_address' => 'Jl. Contoh No. 123, Jakarta',
                'business_phone' => '021-12345678',
                'business_email' => 'demo@possystem.local',
                'currency' => 'IDR',
                'timezone' => 'Asia/Jakarta',
                'enable_appointments' => true,
                'appointment_slot_duration' => 30,
                'opening_time' => '09:00:00',
                'closing_time' => '21:00:00',
                'working_days' => json_encode([1, 2, 3, 4, 5, 6]), // Monday - Saturday
            ]
        );

        // Create Categories
        $categories = [
            ['name' => 'Makanan & Minuman', 'description' => 'Kategori untuk makanan dan minuman', 'image' => 'default-category.png'],
            ['name' => 'Elektronik', 'description' => 'Kategori untuk produk elektronik', 'image' => 'default-category.png'],
            ['name' => 'Fashion', 'description' => 'Kategori untuk produk fashion', 'image' => 'default-category.png'],
            ['name' => 'Kesehatan & Kecantikan', 'description' => 'Kategori untuk produk kesehatan dan kecantikan', 'image' => 'default-category.png'],
            ['name' => 'Alat Tulis', 'description' => 'Kategori untuk alat tulis kantor', 'image' => 'default-category.png'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }

        // Create Products - All with image field
        $products = [
            ['category_id' => 1, 'title' => 'Aqua 600ml', 'description' => 'Air mineral dalam kemasan', 'buy_price' => 2000, 'sell_price' => 3000, 'stock' => 100, 'image' => 'default-product.png', 'barcode' => '8991234567890'],
            ['category_id' => 1, 'title' => 'Indomie Goreng', 'description' => 'Mie instan rasa goreng', 'buy_price' => 2500, 'sell_price' => 3500, 'stock' => 200, 'image' => 'default-product.png', 'barcode' => '8991234567891'],
            ['category_id' => 1, 'title' => 'Teh Botol Sosro', 'description' => 'Teh dalam kemasan botol', 'buy_price' => 3000, 'sell_price' => 4500, 'stock' => 80, 'image' => 'default-product.png', 'barcode' => '8991234567892'],
            ['category_id' => 2, 'title' => 'Kabel USB Type-C', 'description' => 'Kabel charger 1 meter', 'buy_price' => 15000, 'sell_price' => 25000, 'stock' => 50, 'image' => 'default-product.png', 'barcode' => '8991234567893'],
            ['category_id' => 2, 'title' => 'Powerbank 10000mAh', 'description' => 'Powerbank fast charging', 'buy_price' => 80000, 'sell_price' => 120000, 'stock' => 30, 'image' => 'default-product.png', 'barcode' => '8991234567894'],
            ['category_id' => 3, 'title' => 'Kaos Polos Hitam', 'description' => 'Kaos cotton combed 30s', 'buy_price' => 25000, 'sell_price' => 50000, 'stock' => 75, 'image' => 'default-product.png', 'barcode' => '8991234567895'],
            ['category_id' => 3, 'title' => 'Topi Baseball', 'description' => 'Topi polos berbagai warna', 'buy_price' => 20000, 'sell_price' => 45000, 'stock' => 40, 'image' => 'default-product.png', 'barcode' => '8991234567896'],
            ['category_id' => 4, 'title' => 'Shampoo Anti Ketombe', 'description' => 'Shampoo 200ml', 'buy_price' => 18000, 'sell_price' => 30000, 'stock' => 60, 'image' => 'default-product.png', 'barcode' => '8991234567897'],
            ['category_id' => 4, 'title' => 'Sabun Mandi Cair', 'description' => 'Sabun cair 250ml', 'buy_price' => 15000, 'sell_price' => 25000, 'stock' => 70, 'image' => 'default-product.png', 'barcode' => '8991234567898'],
            ['category_id' => 5, 'title' => 'Pulpen Hitam', 'description' => 'Pulpen tinta hitam isi 12', 'buy_price' => 15000, 'sell_price' => 24000, 'stock' => 100, 'image' => 'default-product.png', 'barcode' => '8991234567899'],
            ['category_id' => 5, 'title' => 'Buku Tulis 48 Lembar', 'description' => 'Buku tulis bergaris', 'buy_price' => 3000, 'sell_price' => 5000, 'stock' => 150, 'image' => 'default-product.png', 'barcode' => '8991234567900'],
            ['category_id' => 5, 'title' => 'Penghapus Putih', 'description' => 'Penghapus karet putih', 'buy_price' => 1000, 'sell_price' => 2000, 'stock' => 200, 'image' => 'default-product.png', 'barcode' => '8991234567901'],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['barcode' => $product['barcode']],
                $product
            );
        }

        // Create Customers
        $customers = [
            ['name' => 'Budi Santoso', 'phone' => 81234567890, 'address' => 'Jl. Merdeka No. 10, Jakarta'],
            ['name' => 'Siti Nurhaliza', 'phone' => 81234567891, 'address' => 'Jl. Sudirman No. 20, Bandung'],
            ['name' => 'Ahmad Dhani', 'phone' => 81234567892, 'address' => 'Jl. Gatot Subroto No. 30, Surabaya'],
            ['name' => 'Dewi Lestari', 'phone' => 81234567893, 'address' => 'Jl. Thamrin No. 40, Yogyakarta'],
            ['name' => 'Eko Prasetyo', 'phone' => 81234567894, 'address' => 'Jl. Ahmad Yani No. 50, Semarang'],
            ['name' => 'Fitri Handayani', 'phone' => 81234567895, 'address' => 'Jl. Diponegoro No. 60, Malang'],
            ['name' => 'Gunawan Wibisono', 'phone' => 81234567896, 'address' => 'Jl. Imam Bonjol No. 70, Medan'],
            ['name' => 'Hani Rahmawati', 'phone' => 81234567897, 'address' => 'Jl. Cut Nyak Dien No. 80, Palembang'],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(
                ['phone' => $customer['phone']],
                $customer
            );
        }

        // Create Staff (for Beauty Salon)
        $staffs = [
            ['name' => 'Lisa Beauty Expert', 'email' => 'lisa@possystem.local', 'phone' => '081234560001', 'specialization' => 'Hair Stylist', 'commission_rate' => 30, 'is_active' => true],
            ['name' => 'Jennie Nail Artist', 'email' => 'jennie@possystem.local', 'phone' => '081234560002', 'specialization' => 'Nail Technician', 'commission_rate' => 25, 'is_active' => true],
            ['name' => 'Rose Skin Care', 'email' => 'rose@possystem.local', 'phone' => '081234560003', 'specialization' => 'Facial Specialist', 'commission_rate' => 35, 'is_active' => true],
            ['name' => 'Jisoo Makeup', 'email' => 'jisoo@possystem.local', 'phone' => '081234560004', 'specialization' => 'Makeup Artist', 'commission_rate' => 40, 'is_active' => true],
            ['name' => 'Tina Hair Color', 'email' => 'tina@possystem.local', 'phone' => '081234560005', 'specialization' => 'Hair Color Specialist', 'commission_rate' => 30, 'is_active' => true],
        ];

        foreach ($staffs as $staff) {
            Staff::firstOrCreate(
                ['email' => $staff['email']],
                $staff
            );
        }

        // Create Services (for Beauty Salon) - using category_id 4 (Kesehatan & Kecantikan)
        $services = [
            // Hair Services
            ['name' => 'Haircut Pria', 'description' => 'Potong rambut untuk pria dengan gaya modern', 'category_id' => 4, 'price' => 50000, 'duration' => 30, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Haircut Wanita', 'description' => 'Potong rambut untuk wanita dengan berbagai gaya', 'category_id' => 4, 'price' => 75000, 'duration' => 45, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Hair Coloring', 'description' => 'Pewarnaan rambut dengan cat berkualitas', 'category_id' => 4, 'price' => 250000, 'duration' => 120, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Hair Treatment', 'description' => 'Perawatan rambut dengan creambath dan vitamin', 'category_id' => 4, 'price' => 150000, 'duration' => 60, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Hair Rebonding', 'description' => 'Rebonding untuk rambut lurus sempurna', 'category_id' => 4, 'price' => 500000, 'duration' => 180, 'image' => 'default-service.png', 'is_active' => true],
            // Facial Services
            ['name' => 'Facial Basic', 'description' => 'Facial dasar untuk kulit sehat', 'category_id' => 4, 'price' => 100000, 'duration' => 60, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Facial Acne', 'description' => 'Facial khusus untuk kulit berjerawat', 'category_id' => 4, 'price' => 150000, 'duration' => 75, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Facial Whitening', 'description' => 'Facial untuk mencerahkan kulit', 'category_id' => 4, 'price' => 200000, 'duration' => 90, 'image' => 'default-service.png', 'is_active' => true],
            // Nail Services
            ['name' => 'Manicure', 'description' => 'Perawatan kuku tangan dengan cat kuku', 'category_id' => 4, 'price' => 50000, 'duration' => 45, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Pedicure', 'description' => 'Perawatan kuku kaki dengan cat kuku', 'category_id' => 4, 'price' => 60000, 'duration' => 60, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Nail Art', 'description' => 'Nail art dengan design custom', 'category_id' => 4, 'price' => 100000, 'duration' => 90, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Gel Nails', 'description' => 'Aplikasi gel nails yang tahan lama', 'category_id' => 4, 'price' => 150000, 'duration' => 120, 'image' => 'default-service.png', 'is_active' => true],
            // Makeup Services
            ['name' => 'Makeup Natural', 'description' => 'Makeup natural untuk acara santai', 'category_id' => 4, 'price' => 200000, 'duration' => 60, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Makeup Party', 'description' => 'Makeup untuk pesta dan acara formal', 'category_id' => 4, 'price' => 300000, 'duration' => 90, 'image' => 'default-service.png', 'is_active' => true],
            ['name' => 'Makeup Wedding', 'description' => 'Makeup pengantin lengkap dengan hairdo', 'category_id' => 4, 'price' => 1500000, 'duration' => 180, 'image' => 'default-service.png', 'is_active' => true],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['name' => $service['name']],
                $service
            );
        }

        $this->command->info('✅ Demo data seeded successfully!');
        $this->command->info('📊 Created:');
        $this->command->info('   - 1 Business Setting');
        $this->command->info('   - 5 Categories');
        $this->command->info('   - 12 Products');
        $this->command->info('   - 8 Customers');
        $this->command->info('   - 5 Staff Members');
        $this->command->info('   - 15 Services');
    }
}
