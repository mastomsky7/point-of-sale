# Database Schema Documentation

## Overview

This document provides comprehensive documentation of the database schema for the Point of Sales system with Beauty Salon features.

**Database Engine:** MySQL 8.0
**Character Set:** utf8mb4
**Collation:** utf8mb4_unicode_ci
**Total Tables:** 28

---

## Table of Contents

1. [Core POS Tables](#core-pos-tables)
2. [Salon Management Tables](#salon-management-tables)
3. [Customer Management Tables](#customer-management-tables)
4. [System Tables](#system-tables)
5. [Permission Tables](#permission-tables)
6. [Relationships Diagram](#relationships-diagram)
7. [Indexes](#indexes)

---

## Core POS Tables

### `users`
System users (cashiers, admins, staff).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | User's full name |
| email | varchar(255) | NO | | Unique email address |
| email_verified_at | timestamp | YES | NULL | Email verification timestamp |
| password | varchar(255) | NO | | Hashed password |
| remember_token | varchar(100) | YES | NULL | Remember me token |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `email`

---

### `products`
Product catalog for POS.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| category_id | bigint unsigned | NO | | Foreign key to categories |
| image | varchar(255) | NO | | Product image path |
| barcode | varchar(255) | NO | | Unique barcode |
| title | varchar(255) | NO | | Product name |
| description | text | NO | | Product description |
| buy_price | bigint | NO | | Purchase price (in smallest currency unit) |
| sell_price | bigint | NO | | Selling price (in smallest currency unit) |
| stock | int | NO | | Current stock quantity |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `barcode`
- INDEX: `category_id`
- INDEX: `stock`
- INDEX: `sell_price`
- COMPOSITE INDEX: `(category_id, title)`

**Foreign Keys:**
- `category_id` REFERENCES `categories(id)` ON DELETE CASCADE

---

### `categories`
Product categories.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | Category name |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`

---

### `transactions`
Sales transactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| cashier_id | bigint unsigned | NO | | Foreign key to users (cashier) |
| customer_id | bigint unsigned | YES | NULL | Foreign key to customers |
| appointment_id | bigint unsigned | YES | NULL | Foreign key to appointments |
| invoice | varchar(255) | NO | | Unique invoice number (INV-YYYYMMDD-NNNN) |
| cash_amount | bigint | NO | 0 | Cash received |
| change_amount | bigint | NO | 0 | Change returned |
| grand_total | bigint | NO | 0 | Total amount |
| discount | bigint | NO | 0 | Discount amount |
| payment_method | varchar(255) | NO | cash | Payment method (cash, qris, bank_transfer, etc.) |
| payment_status | varchar(255) | NO | pending | Payment status (pending, paid, failed, voided) |
| voided_at | timestamp | YES | NULL | Transaction void timestamp |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `invoice`
- INDEX: `cashier_id`
- INDEX: `customer_id`
- INDEX: `appointment_id`
- INDEX: `payment_status`
- INDEX: `created_at`
- INDEX: `payment_method`
- INDEX: `grand_total`
- COMPOSITE INDEX: `(created_at, customer_id)`

**Foreign Keys:**
- `cashier_id` REFERENCES `users(id)` ON DELETE CASCADE
- `customer_id` REFERENCES `customers(id)` ON DELETE SET NULL
- `appointment_id` REFERENCES `appointments(id)` ON DELETE SET NULL

---

### `transaction_details`
Line items for transactions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| transaction_id | bigint unsigned | NO | | Foreign key to transactions |
| product_id | bigint unsigned | YES | NULL | Foreign key to products |
| service_id | bigint unsigned | YES | NULL | Foreign key to services |
| staff_id | bigint unsigned | YES | NULL | Foreign key to staff (for services) |
| qty | int | NO | 1 | Quantity |
| price | bigint | NO | | Unit price |
| duration | int | NO | 0 | Service duration in minutes |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `transaction_id`
- INDEX: `product_id`
- INDEX: `service_id`
- INDEX: `staff_id`
- COMPOSITE INDEX: `(transaction_id, product_id)`

**Foreign Keys:**
- `transaction_id` REFERENCES `transactions(id)` ON DELETE CASCADE
- `product_id` REFERENCES `products(id)` ON DELETE SET NULL
- `service_id` REFERENCES `services(id)` ON DELETE SET NULL
- `staff_id` REFERENCES `staff(id)` ON DELETE SET NULL

---

### `carts`
Shopping cart items (temporary).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| cashier_id | bigint unsigned | NO | | Foreign key to users (cashier) |
| customer_id | bigint unsigned | YES | NULL | Foreign key to customers (for appointments) |
| appointment_id | bigint unsigned | YES | NULL | Foreign key to appointments |
| product_id | bigint unsigned | YES | NULL | Foreign key to products |
| service_id | bigint unsigned | YES | NULL | Foreign key to services |
| staff_id | bigint unsigned | YES | NULL | Foreign key to staff |
| qty | int | NO | 1 | Quantity |
| price | bigint | NO | | Unit price |
| duration | int | NO | 0 | Service duration |
| hold_id | varchar(255) | YES | NULL | Hold transaction identifier |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `cashier_id`
- INDEX: `customer_id`
- INDEX: `appointment_id`
- INDEX: `hold_id`
- COMPOSITE INDEX: `(cashier_id, hold_id)`
- COMPOSITE INDEX: `(cashier_id, product_id, hold_id)`
- COMPOSITE INDEX: `(cashier_id, service_id, staff_id, hold_id)`

**Foreign Keys:**
- `cashier_id` REFERENCES `users(id)` ON DELETE CASCADE
- `customer_id` REFERENCES `customers(id)` ON DELETE SET NULL
- `appointment_id` REFERENCES `appointments(id)` ON DELETE SET NULL
- `product_id` REFERENCES `products(id)` ON DELETE CASCADE
- `service_id` REFERENCES `services(id)` ON DELETE CASCADE
- `staff_id` REFERENCES `staff(id)` ON DELETE CASCADE

---

### `profits`
Profit tracking per transaction (optional).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| transaction_id | bigint unsigned | NO | | Foreign key to transactions |
| buy_price | bigint | NO | | Total cost |
| sell_price | bigint | NO | | Total revenue |
| profit | bigint | NO | | Profit amount |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `transaction_id`
- INDEX: `created_at`

**Foreign Keys:**
- `transaction_id` REFERENCES `transactions(id)` ON DELETE CASCADE

---

## Salon Management Tables

### `services`
Service catalog.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | Service name |
| description | text | YES | NULL | Service description |
| price | decimal(10,2) | NO | | Service price |
| duration | int | NO | 30 | Duration in minutes |
| category_id | bigint unsigned | YES | NULL | Foreign key to categories (optional) |
| image | varchar(255) | YES | NULL | Service image |
| is_active | tinyint(1) | NO | 1 | Active status |
| requires_staff | tinyint(1) | NO | 0 | Whether staff assignment is required |
| commission_percent | int | NO | 0 | Commission percentage for staff |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `category_id`
- INDEX: `is_active`
- COMPOSITE INDEX: `(category_id, price)`

---

### `staff`
Staff members.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| user_id | bigint unsigned | YES | NULL | Foreign key to users (optional link) |
| name | varchar(255) | NO | | Staff name |
| is_active | tinyint(1) | NO | 1 | Active status |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `is_active`

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE SET NULL

---

### `appointments`
Appointment bookings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| customer_id | bigint unsigned | NO | | Foreign key to customers |
| staff_id | bigint unsigned | YES | NULL | Primary staff assigned |
| transaction_id | bigint unsigned | YES | NULL | Foreign key to transactions (after payment) |
| created_by | bigint unsigned | YES | NULL | Foreign key to users (who created) |
| appointment_number | varchar(255) | NO | | Unique appointment number (APT-YYYYMMDD-NNNN) |
| appointment_date | date | NO | | Appointment date |
| appointment_time | time | NO | | Appointment time |
| status | varchar(255) | NO | pending | Status (pending, confirmed, completed, cancelled, no_show) |
| payment_status | varchar(255) | NO | pending | Payment status (pending, paid, partial) |
| notes | text | YES | NULL | Appointment notes |
| cancellation_reason | text | YES | NULL | Cancellation reason |
| google_calendar_event_id | varchar(255) | YES | NULL | Google Calendar event ID |
| reminder_24h_sent_at | timestamp | YES | NULL | 24h reminder sent timestamp |
| reminder_1h_sent_at | timestamp | YES | NULL | 1h reminder sent timestamp |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `appointment_number`
- INDEX: `customer_id`
- INDEX: `staff_id`
- INDEX: `transaction_id`
- INDEX: `created_by`
- INDEX: `appointment_date`
- INDEX: `status`
- INDEX: `google_calendar_event_id`
- COMPOSITE INDEX: `(customer_id, appointment_date)`
- COMPOSITE INDEX: `(staff_id, appointment_date, status)`
- COMPOSITE INDEX: `(appointment_date, reminder_24h_sent_at, status)`
- COMPOSITE INDEX: `(appointment_date, reminder_1h_sent_at, status)`

**Foreign Keys:**
- `customer_id` REFERENCES `customers(id)` ON DELETE CASCADE
- `staff_id` REFERENCES `staff(id)` ON DELETE SET NULL
- `transaction_id` REFERENCES `transactions(id)` ON DELETE SET NULL
- `created_by` REFERENCES `users(id)` ON DELETE SET NULL

---

### `appointment_services`
Services included in appointment (many-to-many).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| appointment_id | bigint unsigned | NO | | Foreign key to appointments |
| service_id | bigint unsigned | NO | | Foreign key to services |
| staff_id | bigint unsigned | YES | NULL | Foreign key to staff for this service |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `appointment_id`
- INDEX: `service_id`
- INDEX: `staff_id`
- COMPOSITE INDEX: `(appointment_id, service_id)`

**Foreign Keys:**
- `appointment_id` REFERENCES `appointments(id)` ON DELETE CASCADE
- `service_id` REFERENCES `services(id)` ON DELETE CASCADE
- `staff_id` REFERENCES `staff(id)` ON DELETE SET NULL

---

### `appointment_feedbacks`
Customer feedback for appointments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| appointment_id | bigint unsigned | NO | | Foreign key to appointments |
| rating | int | NO | | Rating (1-5) |
| comment | text | YES | NULL | Feedback comment |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `appointment_id`

**Foreign Keys:**
- `appointment_id` REFERENCES `appointments(id)` ON DELETE CASCADE

---

## Customer Management Tables

### `customers`
Customer profiles and loyalty data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | Customer name |
| no_telp | bigint | NO | | Phone number (numeric only) |
| email | varchar(255) | YES | NULL | Email address |
| address | text | NO | | Address |
| loyalty_points | int | NO | 0 | Current loyalty points |
| total_points_earned | int | NO | 0 | Total points earned (lifetime) |
| total_points_redeemed | int | NO | 0 | Total points redeemed |
| loyalty_tier | varchar(255) | NO | bronze | Tier (bronze, silver, gold, platinum) |
| total_spend | decimal(15,2) | NO | 0.00 | Total lifetime spending |
| visit_count | int | NO | 0 | Total visit count |
| first_visit_at | timestamp | YES | NULL | First visit timestamp |
| last_visit_at | timestamp | YES | NULL | Last visit timestamp |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- INDEX: `no_telp`
- INDEX: `loyalty_points`
- INDEX: `loyalty_tier`
- INDEX: `total_spend`
- INDEX: `visit_count`
- COMPOSITE INDEX: `(loyalty_tier, total_spend)`
- COMPOSITE INDEX: `(visit_count, last_visit_at)`

**Loyalty Tiers:**
- Bronze: $0 - $1,000,000
- Silver: $1,000,001 - $5,000,000
- Gold: $5,000,001 - $10,000,000
- Platinum: $10,000,001+

---

## System Tables

### `payment_settings`
Payment gateway and notification settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| midtrans_enabled | tinyint(1) | NO | 0 | Midtrans enabled |
| midtrans_server_key | text | YES | NULL | Midtrans server key |
| midtrans_client_key | text | YES | NULL | Midtrans client key |
| midtrans_is_production | tinyint(1) | NO | 0 | Production mode |
| xendit_enabled | tinyint(1) | NO | 0 | Xendit enabled |
| xendit_api_key | text | YES | NULL | Xendit API key |
| xendit_webhook_token | text | YES | NULL | Xendit webhook token |
| whatsapp_enabled | tinyint(1) | NO | 0 | WhatsApp enabled |
| whatsapp_api_url | text | YES | NULL | WhatsApp API URL |
| whatsapp_api_token | text | YES | NULL | WhatsApp API token |
| whatsapp_phone_number_id | text | YES | NULL | WhatsApp phone number ID |
| whatsapp_reminder_hours | int | NO | 24 | Reminder hours before appointment |
| email_enabled | tinyint(1) | NO | 0 | Email enabled |
| email_driver | varchar(255) | YES | smtp | Email driver |
| email_host | varchar(255) | YES | NULL | SMTP host |
| email_port | int | YES | 587 | SMTP port |
| email_username | varchar(255) | YES | NULL | SMTP username |
| email_password | text | YES | NULL | SMTP password |
| email_encryption | varchar(255) | YES | tls | Encryption (tls, ssl) |
| email_from_address | varchar(255) | YES | NULL | From email address |
| email_from_name | varchar(255) | YES | NULL | From name |
| sms_enabled | tinyint(1) | NO | 0 | SMS enabled |
| sms_driver | varchar(255) | YES | NULL | SMS driver (twilio, vonage) |
| sms_account_sid | varchar(255) | YES | NULL | Twilio Account SID |
| sms_auth_token | text | YES | NULL | Twilio Auth Token |
| sms_phone_number | varchar(255) | YES | NULL | SMS sender number |
| google_calendar_enabled | tinyint(1) | NO | 0 | Google Calendar enabled |
| google_calendar_id | varchar(255) | YES | NULL | Calendar ID |
| google_calendar_credentials | text | YES | NULL | OAuth credentials JSON |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`

---

### `business_settings`
Business configuration.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| business_name | varchar(255) | YES | NULL | Business name |
| business_address | text | YES | NULL | Business address |
| business_phone | varchar(255) | YES | NULL | Business phone |
| business_email | varchar(255) | YES | NULL | Business email |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`

---

## Permission Tables

### `roles`
User roles (Spatie Permission package).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | Role name |
| guard_name | varchar(255) | NO | | Guard name |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `(name, guard_name)`

---

### `permissions`
System permissions (Spatie Permission package).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint unsigned | NO | AUTO_INCREMENT | Primary key |
| name | varchar(255) | NO | | Permission name |
| guard_name | varchar(255) | NO | | Guard name |
| created_at | timestamp | YES | NULL | Record creation timestamp |
| updated_at | timestamp | YES | NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `(name, guard_name)`

---

### `model_has_permissions`
Model-permission assignments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| permission_id | bigint unsigned | NO | | Foreign key to permissions |
| model_type | varchar(255) | NO | | Model class name |
| model_id | bigint unsigned | NO | | Model ID |

**Indexes:**
- COMPOSITE PRIMARY KEY: `(permission_id, model_id, model_type)`
- INDEX: `model_id`

---

### `model_has_roles`
Model-role assignments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| role_id | bigint unsigned | NO | | Foreign key to roles |
| model_type | varchar(255) | NO | | Model class name |
| model_id | bigint unsigned | NO | | Model ID |

**Indexes:**
- COMPOSITE PRIMARY KEY: `(role_id, model_id, model_type)`
- INDEX: `model_id`

---

### `role_has_permissions`
Role-permission assignments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| permission_id | bigint unsigned | NO | | Foreign key to permissions |
| role_id | bigint unsigned | NO | | Foreign key to roles |

**Indexes:**
- COMPOSITE PRIMARY KEY: `(permission_id, role_id)`

---

## Relationships Diagram

```
users
├── transactions (as cashier)
├── appointments (as created_by)
└── staff (optional link)

customers
├── transactions
└── appointments

products
├── transaction_details
├── carts
└── categories

services
├── appointment_services
└── transaction_details

staff
├── appointment_services
├── appointments (primary staff)
├── transaction_details
└── users (optional link)

appointments
├── appointment_services
├── appointment_feedbacks
├── transactions
└── customers

transactions
├── transaction_details
├── profits
└── customers
```

---

## Indexes

### Performance-Critical Indexes

**Composite Indexes for Common Queries:**
1. `transactions (created_at, customer_id)` - Customer transaction history
2. `appointments (customer_id, appointment_date)` - Customer appointment history
3. `appointments (staff_id, appointment_date, status)` - Staff schedule
4. `carts (cashier_id, hold_id)` - Active/held carts
5. `customers (loyalty_tier, total_spend)` - Loyalty queries
6. `products (category_id, title)` - Product catalog search

**Single Column Indexes:**
- All foreign keys for JOIN performance
- `barcode` on products for quick lookups
- `invoice` on transactions for receipt retrieval
- `appointment_number` on appointments
- Payment and status fields for filtering

---

## Data Types and Storage

### Currency Storage
All monetary values stored as BIGINT (smallest currency unit):
- `buy_price`, `sell_price` in products: stored as cents/smallest unit
- `grand_total`, `discount` in transactions: stored as cents/smallest unit
- Convert to display: `amount / 100` for currencies with 2 decimal places

### Timestamps
- All tables include `created_at` and `updated_at`
- Soft deletes use `deleted_at` (only in services table)
- Reminder timestamps in appointments for tracking

### Enumerations
**Transaction Payment Status:**
- pending, paid, failed, voided

**Appointment Status:**
- pending, confirmed, completed, cancelled, no_show

**Loyalty Tiers:**
- bronze, silver, gold, platinum

---

## Maintenance

### Regular Tasks
```sql
-- Analyze tables monthly
ANALYZE TABLE transactions, appointments, customers;

-- Optimize tables quarterly
OPTIMIZE TABLE transactions, transaction_details, appointments;

-- Check index usage
SELECT * FROM sys.schema_unused_indexes;
```

### Backup Recommendations
- Daily backup of all tables
- Keep 30 days of daily backups
- Monthly full backup with retention

---

**Last Updated:** 2026-01-04
**Schema Version:** 1.0
**Total Tables:** 28
**Total Indexes:** 60+
