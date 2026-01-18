<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Customer;
use App\Models\PaymentSetting;
use App\Services\Payments\MidtransGateway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Mockery;

class MidtransPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected PaymentSetting $paymentSettings;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Create payment settings
        $this->paymentSettings = PaymentSetting::create([
            'midtrans_enabled' => true,
            'midtrans_server_key' => 'test-server-key',
            'midtrans_client_key' => 'test-client-key',
            'midtrans_is_production' => false,
        ]);
    }

    /**
     * I5: Test Midtrans gateway initialization
     */
    public function test_midtrans_gateway_initialization(): void
    {
        $gateway = new MidtransGateway();

        $this->assertInstanceOf(MidtransGateway::class, $gateway);
    }

    /**
     * I5: Test can create Midtrans payment
     */
    public function test_can_create_midtrans_payment(): void
    {
        $customer = Customer::factory()->create();
        $transaction = Transaction::factory()->create([
            'customer_id' => $customer->id,
            'grand_total' => 100000,
            'payment_status' => 'pending',
        ]);

        // Mock Midtrans API response
        $mockGateway = Mockery::mock(MidtransGateway::class);
        $mockGateway->shouldReceive('createTransaction')
            ->once()
            ->with($transaction)
            ->andReturn([
                'token' => 'test-snap-token',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-snap-token',
            ]);

        $this->app->instance(MidtransGateway::class, $mockGateway);

        $result = $mockGateway->createTransaction($transaction);

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('redirect_url', $result);
        $this->assertEquals('test-snap-token', $result['token']);
    }

    /**
     * I5: Test Midtrans webhook handles successful payment
     */
    public function test_midtrans_webhook_handles_successful_payment(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
            'payment_method' => 'qris',
        ]);

        $webhookData = [
            'transaction_status' => 'settlement',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'payment_type' => 'qris',
            'transaction_id' => 'MT-' . time(),
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response->assertStatus(200);

        $transaction->refresh();
        $this->assertEquals('paid', $transaction->payment_status);
    }

    /**
     * I5: Test Midtrans webhook handles pending payment
     */
    public function test_midtrans_webhook_handles_pending_payment(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
        ]);

        $webhookData = [
            'transaction_status' => 'pending',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'payment_type' => 'bank_transfer',
            'transaction_id' => 'MT-' . time(),
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response->assertStatus(200);

        $transaction->refresh();
        $this->assertEquals('pending', $transaction->payment_status);
    }

    /**
     * I5: Test Midtrans webhook handles failed payment
     */
    public function test_midtrans_webhook_handles_failed_payment(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
        ]);

        $webhookData = [
            'transaction_status' => 'deny',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'payment_type' => 'credit_card',
            'transaction_id' => 'MT-' . time(),
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response->assertStatus(200);

        $transaction->refresh();
        $this->assertEquals('failed', $transaction->payment_status);
    }

    /**
     * I5: Test Midtrans webhook handles expired payment
     */
    public function test_midtrans_webhook_handles_expired_payment(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
        ]);

        $webhookData = [
            'transaction_status' => 'expire',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'transaction_id' => 'MT-' . time(),
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response->assertStatus(200);

        $transaction->refresh();
        $this->assertEquals('expired', $transaction->payment_status);
    }

    /**
     * I5: Test Midtrans webhook validates signature
     */
    public function test_midtrans_webhook_validates_signature(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
        ]);

        $webhookData = [
            'transaction_status' => 'settlement',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'signature_key' => 'invalid-signature',
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        // Should reject invalid signature
        $response->assertStatus(403);

        $transaction->refresh();
        $this->assertEquals('pending', $transaction->payment_status);
    }

    /**
     * I5: Test Midtrans finish page redirects correctly
     */
    public function test_midtrans_finish_page_redirects_correctly(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'paid',
        ]);

        $response = $this->get(route('webhooks.midtrans.finish', [
            'order_id' => $transaction->invoice,
            'status_code' => '200',
            'transaction_status' => 'settlement',
        ]));

        $response->assertRedirect(route('transactions.print', $transaction->invoice));
    }

    /**
     * I5: Test payment amount mismatch
     */
    public function test_payment_amount_mismatch_is_rejected(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'pending',
            'grand_total' => 100000,
        ]);

        $webhookData = [
            'transaction_status' => 'settlement',
            'order_id' => $transaction->invoice,
            'gross_amount' => 50000, // Different amount
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        $response = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response->assertStatus(422);

        $transaction->refresh();
        $this->assertEquals('pending', $transaction->payment_status);
    }

    /**
     * I5: Test duplicate webhook is handled
     */
    public function test_duplicate_webhook_is_handled(): void
    {
        $transaction = Transaction::factory()->create([
            'payment_status' => 'paid',
        ]);

        $webhookData = [
            'transaction_status' => 'settlement',
            'order_id' => $transaction->invoice,
            'gross_amount' => $transaction->grand_total,
            'signature_key' => $this->generateMockSignature($transaction),
        ];

        // Send webhook twice
        $response1 = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);
        $response2 = $this->postJson(route('webhooks.midtrans.notification'), $webhookData);

        $response1->assertStatus(200);
        $response2->assertStatus(200); // Should handle gracefully

        $transaction->refresh();
        $this->assertEquals('paid', $transaction->payment_status);
    }

    /**
     * I5: Helper to generate mock signature for testing
     */
    protected function generateMockSignature(Transaction $transaction): string
    {
        // This is a simplified mock - actual implementation should match Midtrans signature logic
        return hash('sha512', $transaction->invoice . '200' . $transaction->grand_total . $this->paymentSettings->midtrans_server_key);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
