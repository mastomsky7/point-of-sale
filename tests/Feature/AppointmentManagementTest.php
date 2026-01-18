<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Carbon\Carbon;

class AppointmentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create user with permissions
        $this->user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);

        Permission::create(['name' => 'appointments-access']);
        Permission::create(['name' => 'appointments-create']);
        Permission::create(['name' => 'appointments-edit']);
        Permission::create(['name' => 'appointments-delete']);

        $role->givePermissionTo([
            'appointments-access',
            'appointments-create',
            'appointments-edit',
            'appointments-delete',
        ]);

        $this->user->assignRole($role);
    }

    /**
     * I2: Test can view appointments list
     */
    public function test_can_view_appointments_list(): void
    {
        Appointment::factory()->count(3)->create();

        $response = $this->actingAs($this->user)->get(route('appointments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Dashboard/Appointments/Index'));
    }

    /**
     * I2: Test can create new appointment
     */
    public function test_can_create_new_appointment(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['price' => 100000, 'duration' => 30]);
        $staff = Staff::factory()->create();

        $appointmentData = [
            'customer_id' => $customer->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'appointment_time' => '10:00',
            'services' => [
                [
                    'service_id' => $service->id,
                    'staff_id' => $staff->id,
                ]
            ],
            'notes' => 'Test appointment',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);
    }

    /**
     * I2: Test can confirm appointment
     */
    public function test_can_confirm_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('appointments.confirm', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * I2: Test can cancel appointment
     */
    public function test_can_cancel_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('appointments.cancel', $appointment), [
                'reason' => 'Customer requested',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'Customer requested',
        ]);
    }

    /**
     * I2: Test can complete appointment
     */
    public function test_can_complete_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('appointments.complete', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    /**
     * I2: Test cannot create appointment with past date
     */
    public function test_cannot_create_appointment_with_past_date(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create();
        $staff = Staff::factory()->create();

        $appointmentData = [
            'customer_id' => $customer->id,
            'appointment_date' => Carbon::yesterday()->format('Y-m-d'),
            'appointment_time' => '10:00',
            'services' => [
                [
                    'service_id' => $service->id,
                    'staff_id' => $staff->id,
                ]
            ],
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertSessionHasErrors('appointment_date');
    }

    /**
     * I2: Test can reschedule appointment
     */
    public function test_can_reschedule_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'appointment_date' => Carbon::tomorrow(),
            'appointment_time' => '10:00',
            'status' => 'confirmed',
        ]);

        $newDate = Carbon::tomorrow()->addDays(2);

        $response = $this->actingAs($this->user)
            ->post(route('appointments.process-reschedule', $appointment), [
                'appointment_date' => $newDate->format('Y-m-d'),
                'appointment_time' => '14:00',
                'reason' => 'Customer request',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'appointment_date' => $newDate->format('Y-m-d'),
            'appointment_time' => '14:00',
        ]);
    }

    /**
     * I2: Test can view available time slots
     */
    public function test_can_view_available_time_slots(): void
    {
        $staff = Staff::factory()->create();
        $date = Carbon::tomorrow()->format('Y-m-d');

        $response = $this->actingAs($this->user)
            ->get(route('appointments.availableSlots', [
                'staff_id' => $staff->id,
                'date' => $date,
            ]));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'slots'
        ]);
    }

    /**
     * I2: Test unauthorized user cannot access appointments
     */
    public function test_unauthorized_user_cannot_access_appointments(): void
    {
        $unauthorizedUser = User::factory()->create();

        $response = $this->actingAs($unauthorizedUser)
            ->get(route('appointments.index'));

        $response->assertStatus(403);
    }

    /**
     * I2: Test can delete appointment
     */
    public function test_can_delete_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseMissing('appointments', [
            'id' => $appointment->id,
        ]);
    }
}
