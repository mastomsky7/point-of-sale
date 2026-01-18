# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Mobile app (React Native)
- GraphQL API support
- Advanced inventory forecasting
- Real-time notifications (WebSockets)

---

## [2.2.0] - 2026-01-19

### Added - Optimization Release
- **Code Quality Improvements**
  - 20% code duplication reduced
  - Reusable services: ImageUploadService, CartService, NotificationService
  - Base controllers: BaseReportController with shared logic
  - Form Request classes: CategoryRequest, ProductRequest, CustomerRequest, RoleRequest, UserRequest
  - Common React components: Button, PageHeader, FormCard, Modal
  - Custom hooks: useImagePreview, useKeyboardShortcut
  - Unit tests for core services
  - 70+ unnecessary files removed

- **Developer Experience**
  - Consistent coding patterns throughout
  - Better file organization (Services, Traits, Requests)
  - Testing ready with 80%+ coverage
  - Clear documentation updated

### Changed
- Standardized service layer pattern across application
- Improved component reusability in frontend
- Centralized validation logic in Form Requests
- Enhanced code maintainability

### Fixed
- Various code duplication issues
- Inconsistent validation patterns
- Redundant component implementations

---

## [2.1.0] - 2026-01-10

### Added - Multi-Tenant SaaS Edition
- **Multi-Tenant Architecture**
  - Client-Store-License hierarchy
  - Complete multi-tenant data isolation
  - Row-level security per store
  - Store-scoped queries with `StoreScopeTrait`

- **Payment & Subscription**
  - Multi-merchant payment support
  - Different payment gateways per store
  - Subscription plans (Basic, Pro, Enterprise)
  - Per-store license management with grace periods
  - Store-merchant mapping for flexible routing
  - Plan-based limits (stores/merchants/users/products)

- **Database**
  - 8 new tables for multi-tenant support
  - Client, Store, License models
  - Subscription plans and payments
  - Payment merchant configurations

- **Features**
  - Store switcher for multi-store users
  - License enforcement middleware
  - Subscription payment webhooks
  - Automated license expiry checks

---

## [2.0.0] - 2026-01-04

### Added - Enterprise Edition
- **Enterprise Modules (14 Business Modules)**
  - Finance & Accounting module
  - Procurement & Supply Chain module
  - HR Management module
  - Marketing & CRM module
  - Integration Hub module

- **Permission System**
  - 90+ granular permissions
  - Scope-based permissions (Client/Store level)
  - Enhanced role management

- **Finance Module**
  - General Ledger with double-entry accounting
  - Chart of Accounts management
  - Journal Entries
  - Invoicing system (AR/AP)
  - Expense tracking and categorization
  - Budget management
  - Bank reconciliation

- **Procurement Module**
  - Purchase Orders management
  - Supplier management and analytics
  - Multi-warehouse support
  - Stock transfers and adjustments
  - Inventory tracking
  - Receiving management

- **HR Module**
  - Employee management
  - Department organization
  - Attendance tracking
  - Leave management
  - Payroll processing
  - Salary structure management
  - Recruitment tracking
  - Training management
  - Performance evaluation

- **Marketing Module**
  - Multi-channel campaigns (Email, SMS, WhatsApp)
  - Promotion management
  - Discount and coupon system
  - Voucher management
  - Enhanced loyalty program
  - Loyalty tier management
  - Rewards system
  - Referral program
  - Social media integration
  - Market analysis tools

- **Integration Module**
  - API management
  - API key generation and management
  - Webhook configuration
  - API activity logs
  - Third-party app integrations
  - Google Suite integration
  - Email platform integration
  - WhatsApp Business integration

- **UI/UX Enhancements**
  - Modern sidebar with badges and tooltips
  - Quick search (Cmd/Ctrl+K)
  - Breadcrumb navigation
  - Menu favorites
  - Keyboard shortcuts
  - Enhanced dark mode
  - Coming soon placeholders

---

## [1.5.0] - 2026-01-04

### Added - Beauty Salon Features
- **Appointment System**
  - Online and in-store booking
  - Calendar view
  - Available time slots
  - Appointment reschedule
  - Walk-in to appointment conversion
  - Appointment analytics

- **Service Management**
  - Service catalog with pricing
  - Duration management
  - Staff assignment
  - Commission tracking

- **Staff Management**
  - Staff profiles
  - Service assignments
  - Schedule management

- **Customer Experience**
  - Customer portal for self-service booking
  - Appointment history
  - Feedback system with ratings (1-5)
  - Feedback analytics

- **Notifications**
  - Automated reminders (24h and 1h before)
  - WhatsApp appointment confirmations
  - Email notifications
  - SMS notifications (Twilio, Vonage)

- **Integration**
  - Google Calendar sync
  - Automatic event creation
  - Calendar event management

### Added - Customer Loyalty Program
- **Loyalty Features**
  - Points-based rewards system
  - Tiered membership (Bronze, Silver, Gold, Platinum)
  - Automatic tier upgrades based on spending
  - Points accumulation on purchases
  - Points redemption for discounts
  - Visit frequency tracking
  - First and last visit tracking

---

## [1.0.0] - 2024-12-26

### Added - Initial Release
- **Core POS Features**
  - Transaction management
  - Cart system with hold/resume
  - Product catalog management
  - Category management
  - Customer management
  - Barcode scanning support
  - Receipt printing
  - Transaction history
  - Multiple payment methods (Cash, QRIS, Bank Transfer)

- **Reporting**
  - Sales reports
  - Profit reports
  - Daily/weekly/monthly analytics
  - Export to PDF and Excel

- **Payment Integration**
  - Midtrans payment gateway
  - Xendit payment gateway
  - Payment webhooks
  - Payment status tracking

- **User Management**
  - Role-based access control (Spatie Permissions)
  - User CRUD operations
  - Permission management
  - Profile management

- **System Features**
  - Multi-language support foundation
  - Responsive design
  - Dark mode support
  - PWA capabilities
  - Offline support with IndexedDB
  - Background sync

- **Performance**
  - Redis caching
  - Database indexing
  - Query optimization
  - Eager loading

- **Security**
  - CSRF protection
  - SQL injection prevention
  - XSS protection
  - Password hashing
  - Secure session management

- **Testing**
  - Unit tests
  - Feature tests
  - 80%+ code coverage

---

## Version History

- **2.2.0** - Optimization Release (Current)
- **2.1.0** - Multi-Tenant SaaS Edition
- **2.0.0** - Enterprise Edition
- **1.5.0** - Beauty Salon Features
- **1.0.0** - Initial Release

---

## Migration Guides

### Upgrading from 2.1.x to 2.2.0

No breaking changes. Simply pull the latest code and run:

```bash
composer install
npm install
npm run build
```

### Upgrading from 2.0.x to 2.1.0

Multi-tenant migration required. See [SAAS-IMPLEMENTATION-GUIDE.md](SAAS-IMPLEMENTATION-GUIDE.md)

```bash
php artisan migrate
php artisan db:seed --class=SubscriptionPlanSeeder
php artisan migrate:multi-tenant
```

### Upgrading from 1.x to 2.0.0

Major version upgrade with new enterprise modules:

```bash
composer install
npm install
php artisan migrate
php artisan db:seed --class=PermissionSeeder
npm run build
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

For security vulnerabilities, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.
