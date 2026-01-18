<?php

namespace Tests\Unit;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Service;
use App\Models\Customer;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * I1: Test invoice number generation
     */
    public function test_generates_unique_invoice_number(): void
    {
        $transaction = Transaction::factory()->create();

        $this->assertNotNull($transaction->invoice);
        $this->assertMatchesRegularExpression('/^INV-\d{8}-\d{4}$/', $transaction->invoice);
    }

    /**
     * I1: Test transaction total calculation
     */
    public function test_calculates_transaction_total(): void
    {
        $transaction = Transaction::factory()->create([
            'grand_total' => 0,
        ]);

        // Add products
        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'product_id' => Product::factory()->create(['sell_price' => 50000])->id,
            'qty' => 2,
            'price' => 50000,
        ]);

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'product_id' => Product::factory()->create(['sell_price' => 75000])->id,
            'qty' => 1,
            'price' => 75000,
        ]);

        $transaction->calculateTotal();

        $this->assertEquals(175000, $transaction->grand_total);
    }

    /**
     * I1: Test transaction with discount
     */
    public function test_applies_discount_to_transaction(): void
    {
        $transaction = Transaction::factory()->create([
            'grand_total' => 200000,
            'discount' => 20000,
        ]);

        $this->assertEquals(180000, $transaction->final_amount);
    }

    /**
     * I1: Test transaction payment status
     */
    public function test_marks_transaction_as_paid(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
        ]);

        $transaction->markAsPaid('qris');

        $this->assertEquals('paid', $transaction->payment_status);
        $this->assertEquals('qris', $transaction->payment_method);
    }

    /**
     * I1: Test transaction has details
     */
    public function test_transaction_has_details(): void
    {
        $transaction = Transaction::factory()->create();

        TransactionDetail::factory()->count(3)->create([
            'transaction_id' => $transaction->id,
        ]);

        $this->assertCount(3, $transaction->details);
        $this->assertInstanceOf(TransactionDetail::class, $transaction->details->first());
    }

    /**
     * I1: Test transaction belongs to customer
     */
    public function test_transaction_belongs_to_customer(): void
    {
        $customer = Customer::factory()->create();
        $transaction = Transaction::factory()->create([
            'customer_id' => $customer->id,
        ]);

        $this->assertInstanceOf(Customer::class, $transaction->customer);
        $this->assertEquals($customer->id, $transaction->customer->id);
    }

    /**
     * I1: Test transaction item count
     */
    public function test_counts_transaction_items(): void
    {
        $transaction = Transaction::factory()->create();

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'qty' => 2,
        ]);

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'qty' => 3,
        ]);

        $this->assertEquals(5, $transaction->total_items);
    }

    /**
     * I1: Test transaction can be voided
     */
    public function test_can_void_transaction(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'paid',
        ]);

        $transaction->void('Duplicate transaction');

        $this->assertEquals('voided', $transaction->payment_status);
        $this->assertNotNull($transaction->voided_at);
    }
}
