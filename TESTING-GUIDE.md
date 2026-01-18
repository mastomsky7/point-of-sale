# Testing Guide - Point of Sales System

## Overview

This document provides comprehensive information about the testing suite for the Point of Sales (POS) system with Beauty Salon features.

## Test Categories

### Category I: Testing & Quality Assurance

Our testing suite is organized into the following categories:

#### I1: Unit Tests - Core Models
Tests individual model methods and business logic in isolation.

**Files:**
- `tests/Unit/CustomerTest.php` - Customer loyalty, points, and tier calculations
- `tests/Unit/AppointmentTest.php` - Appointment lifecycle and state management
- `tests/Unit/TransactionTest.php` - Transaction calculations and payment processing

**Coverage:**
- ✅ Customer loyalty tier calculation (Bronze, Silver, Gold, Platinum)
- ✅ Loyalty points earn and redemption
- ✅ Visit count tracking
- ✅ Appointment status transitions
- ✅ Appointment duration and price calculations
- ✅ Reminder eligibility checks
- ✅ Transaction total calculations
- ✅ Invoice number generation
- ✅ Payment status management

#### I2: Feature Tests - Appointment System
Tests the complete appointment management workflow.

**File:** `tests/Feature/AppointmentManagementTest.php`

**Coverage:**
- ✅ View appointments list with proper permissions
- ✅ Create new appointments with services and staff
- ✅ Confirm pending appointments
- ✅ Cancel appointments with reasons
- ✅ Complete paid appointments
- ✅ Reschedule appointments
- ✅ View available time slots
- ✅ Validate appointment dates (no past dates)
- ✅ Permission-based access control
- ✅ Delete appointments

#### I3: Feature Tests - POS Transactions
Tests the complete Point of Sale workflow.

**File:** `tests/Feature/POSTransactionTest.php`

**Coverage:**
- ✅ View POS page
- ✅ Add products to cart
- ✅ Add services to cart
- ✅ Update cart quantities
- ✅ Remove items from cart
- ✅ Hold/Resume transactions
- ✅ Complete transactions with payment
- ✅ Stock validation (prevent overselling)
- ✅ Stock reduction after purchase
- ✅ Customer statistics updates
- ✅ Transaction history
- ✅ Print receipts

#### I4: API Tests - Offline Sync
Tests the offline synchronization API endpoints.

**File:** `tests/Feature/OfflineSyncTest.php`

**Coverage:**
- ✅ Sync products data
- ✅ Sync services data
- ✅ Sync customers data
- ✅ Sync staff data
- ✅ Sync offline transactions to server
- ✅ Sync offline appointments to server
- ✅ Incremental updates (last_sync timestamp)
- ✅ Authentication requirements
- ✅ Data validation
- ✅ Conflict resolution (insufficient stock)

#### I5: Integration Tests - Payment Gateway
Tests Midtrans payment gateway integration.

**File:** `tests/Feature/MidtransPaymentTest.php`

**Coverage:**
- ✅ Gateway initialization
- ✅ Create payment transactions
- ✅ Webhook: successful payment (settlement)
- ✅ Webhook: pending payment
- ✅ Webhook: failed payment (deny)
- ✅ Webhook: expired payment
- ✅ Signature validation
- ✅ Amount mismatch detection
- ✅ Duplicate webhook handling
- ✅ Finish page redirects

## Running Tests

### Run All Tests
```bash
php artisan test
```

### Run Specific Test Suite
```bash
# Unit tests only
php artisan test --testsuite=Unit

# Feature tests only
php artisan test --testsuite=Feature
```

### Run Specific Test File
```bash
php artisan test tests/Unit/CustomerTest.php
php artisan test tests/Feature/AppointmentManagementTest.php
```

### Run Specific Test Method
```bash
php artisan test --filter test_bronze_tier_for_new_customer
```

### Run with Coverage Report
```bash
php artisan test --coverage
```

### Run with Parallel Execution
```bash
php artisan test --parallel
```

## Test Database

Tests use SQLite in-memory database for speed and isolation:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

Each test gets a fresh database via `RefreshDatabase` trait.

## Writing New Tests

### Unit Test Template
```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * I1: Test description
     */
    public function test_my_feature(): void
    {
        // Arrange
        $model = MyModel::factory()->create();

        // Act
        $result = $model->doSomething();

        // Assert
        $this->assertEquals('expected', $result);
    }
}
```

### Feature Test Template
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyFeatureTest extends TestCase
{
    use RefreshDatabase;

    /**
     * I2: Test description
     */
    public function test_my_endpoint(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/my-endpoint');

        $response->assertStatus(200);
    }
}
```

## Test Coverage Goals

| Module | Current Coverage | Target |
|--------|-----------------|--------|
| Customer Model | 90% | 95% |
| Appointment Model | 85% | 95% |
| Transaction Model | 80% | 95% |
| Appointment Controller | 75% | 90% |
| Transaction Controller | 70% | 90% |
| Sync API | 85% | 95% |
| Payment Gateway | 80% | 90% |

## Best Practices

### 1. Arrange-Act-Assert Pattern
```php
public function test_example(): void
{
    // Arrange: Set up test data
    $customer = Customer::factory()->create();

    // Act: Perform the action
    $customer->addLoyaltyPoints(100);

    // Assert: Verify the result
    $this->assertEquals(100, $customer->loyalty_points);
}
```

### 2. Use Factories
```php
// Good
$customer = Customer::factory()->create(['loyalty_tier' => 'gold']);

// Avoid
$customer = new Customer();
$customer->loyalty_tier = 'gold';
$customer->save();
```

### 3. Test One Thing
```php
// Good - Tests one specific behavior
public function test_silver_tier_threshold(): void
{
    $customer = Customer::factory()->create(['total_spend' => 1500000]);
    $customer->updateLoyaltyTier();
    $this->assertEquals('silver', $customer->loyalty_tier);
}

// Avoid - Tests multiple behaviors
public function test_all_loyalty_tiers(): void
{
    // Testing bronze, silver, gold, platinum all in one test
}
```

### 4. Descriptive Test Names
```php
// Good
public function test_cannot_complete_unpaid_appointment(): void

// Avoid
public function test_appointment(): void
```

### 5. Use Database Transactions
All tests use `RefreshDatabase` trait to ensure database is clean:
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyTest extends TestCase
{
    use RefreshDatabase;
}
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install Dependencies
        run: composer install
      - name: Run Tests
        run: php artisan test
```

## Test Data Factories

Factories are located in `database/factories/`:

- `CustomerFactory.php`
- `AppointmentFactory.php`
- `TransactionFactory.php`
- `ProductFactory.php`
- `ServiceFactory.php`
- `StaffFactory.php`

Example usage:
```php
// Create single model
$customer = Customer::factory()->create();

// Create multiple models
$customers = Customer::factory()->count(10)->create();

// Override attributes
$customer = Customer::factory()->create([
    'loyalty_tier' => 'platinum',
    'total_spend' => 20000000,
]);
```

## Mocking External Services

### Midtrans Gateway Mock
```php
$mockGateway = Mockery::mock(MidtransGateway::class);
$mockGateway->shouldReceive('createTransaction')
    ->once()
    ->andReturn(['token' => 'test-token']);

$this->app->instance(MidtransGateway::class, $mockGateway);
```

### WhatsApp Service Mock
```php
$mockWhatsApp = Mockery::mock(WhatsAppService::class);
$mockWhatsApp->shouldReceive('sendMessage')
    ->once()
    ->andReturn(true);

$this->app->instance(WhatsAppService::class, $mockWhatsApp);
```

## Debugging Failed Tests

### View Full Error Output
```bash
php artisan test --stop-on-failure
```

### Use dd() in Tests
```php
public function test_example(): void
{
    $result = $this->someMethod();
    dd($result); // Dump and die
    $this->assertEquals('expected', $result);
}
```

### Check Database State
```php
public function test_example(): void
{
    // ... perform actions

    // Dump database state
    dd(Customer::all()->toArray());
}
```

## Performance Testing

For load testing and performance benchmarks:

```bash
# Use Laravel Dusk or external tools
php artisan dusk
```

## Security Testing

Tests include security checks for:
- ✅ Authentication requirements
- ✅ Permission-based access control
- ✅ Input validation
- ✅ SQL injection prevention (via Eloquent)
- ✅ XSS prevention (via Blade escaping)
- ✅ CSRF protection

## Maintenance

### Update Tests When:
1. Adding new features
2. Changing business logic
3. Modifying API endpoints
4. Updating payment flows
5. Changing database schema

### Review Tests:
- Weekly: Check failing tests
- Monthly: Review coverage reports
- Quarterly: Update test data and factories

## Support

For testing issues or questions:
1. Check test output for detailed error messages
2. Review relevant test file documentation
3. Ensure all factories are properly seeded
4. Verify database migrations are up to date

---

**Last Updated:** 2026-01-04
**Test Suite Version:** 1.0
**Total Test Cases:** 60+
**Average Execution Time:** ~5 seconds
