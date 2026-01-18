<?php

namespace Tests\Unit;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Service;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * I1: Test appointment number generation
     */
    public function test_generates_unique_appointment_number(): void
    {
        $appointment = Appointment::factory()->create();

        $this->assertNotNull($appointment->appointment_number);
        $this->assertStringStartsWith('APT-', $appointment->appointment_number);
    }

    /**
     * I1: Test appointment status transitions
     */
    public function test_can_confirm_pending_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'pending',
        ]);

        $appointment->confirm();

        $this->assertEquals('confirmed', $appointment->status);
    }

    /**
     * I1: Test appointment cancellation
     */
    public function test_can_cancel_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'pending',
        ]);

        $appointment->cancel('Customer requested');

        $this->assertEquals('cancelled', $appointment->status);
        $this->assertEquals('Customer requested', $appointment->cancellation_reason);
    }

    /**
     * I1: Test appointment completion
     */
    public function test_can_complete_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $appointment->complete();

        $this->assertEquals('completed', $appointment->status);
    }

    /**
     * I1: Test cannot complete unpaid appointment
     */
    public function test_cannot_complete_unpaid_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'confirmed',
            'payment_status' => 'pending',
        ]);

        $result = $appointment->complete();

        $this->assertFalse($result);
        $this->assertEquals('confirmed', $appointment->status);
    }

    /**
     * I1: Test appointment duration calculation
     */
    public function test_calculates_total_duration(): void
    {
        $appointment = Appointment::factory()->create();

        $service1 = Service::factory()->create(['duration' => 30]);
        $service2 = Service::factory()->create(['duration' => 45]);

        $appointment->services()->attach([
            $service1->id => ['staff_id' => Staff::factory()->create()->id],
            $service2->id => ['staff_id' => Staff::factory()->create()->id],
        ]);

        $this->assertEquals(75, $appointment->total_duration);
    }

    /**
     * I1: Test appointment total price calculation
     */
    public function test_calculates_total_price(): void
    {
        $appointment = Appointment::factory()->create();

        $service1 = Service::factory()->create(['price' => 100000]);
        $service2 = Service::factory()->create(['price' => 150000]);

        $appointment->services()->attach([
            $service1->id => ['staff_id' => Staff::factory()->create()->id],
            $service2->id => ['staff_id' => Staff::factory()->create()->id],
        ]);

        $this->assertEquals(250000, $appointment->total_price);
    }

    /**
     * I1: Test appointment is in the past
     */
    public function test_detects_past_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => Carbon::yesterday(),
        ]);

        $this->assertTrue($appointment->isPast());
    }

    /**
     * I1: Test appointment is upcoming
     */
    public function test_detects_upcoming_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => Carbon::tomorrow(),
        ]);

        $this->assertFalse($appointment->isPast());
    }

    /**
     * I1: Test reminder eligibility
     */
    public function test_checks_reminder_eligibility(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => Carbon::now()->addHours(2),
            'status' => 'confirmed',
            'reminder_1h_sent_at' => null,
        ]);

        $this->assertTrue($appointment->needsReminder(1));
    }

    /**
     * I1: Test reminder already sent
     */
    public function test_reminder_not_needed_when_already_sent(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => Carbon::now()->addHours(2),
            'status' => 'confirmed',
            'reminder_1h_sent_at' => Carbon::now(),
        ]);

        $this->assertFalse($appointment->needsReminder(1));
    }
}
