# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.2.x   | :white_check_mark: |
| 2.1.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

**Security Contact:** security@yourdomain.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

* Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English or Indonesian.

## Security Update Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions as soon as possible

## Security Best Practices for Users

When deploying this application:

1. **Environment Configuration**
   - Never commit `.env` files to version control
   - Use strong, unique values for `APP_KEY`
   - Set `APP_DEBUG=false` in production
   - Use HTTPS for all production deployments

2. **Database Security**
   - Use strong database passwords
   - Restrict database access to localhost when possible
   - Keep database software up to date

3. **Payment Gateway Security**
   - Never expose API keys in client-side code
   - Store payment gateway credentials in `.env` file
   - Use production credentials only in production
   - Verify webhook signatures for all payment callbacks

4. **File Upload Security**
   - All uploaded files are stored in `storage/app/public`
   - Validate file types and sizes
   - Scan uploaded files for malware if possible

5. **Authentication & Authorization**
   - Use strong password policies
   - Enable two-factor authentication (if available)
   - Regularly review user permissions
   - Monitor for suspicious login attempts

6. **Regular Updates**
   - Keep Laravel and all dependencies up to date
   - Run `composer update` regularly
   - Monitor security advisories for Laravel and PHP

7. **Backup & Recovery**
   - Maintain regular database backups
   - Test backup restoration procedures
   - Store backups securely and off-site

## Known Security Considerations

### Payment Gateway Integration
- This application integrates with Midtrans and Xendit payment gateways
- Always verify webhook signatures before processing payment notifications
- Never trust payment status from client-side without server-side verification

### Multi-Tenant Data Isolation
- Store-level data isolation is enforced via `StoreScopeTrait`
- Always verify store ownership before displaying or modifying data
- Row-level security prevents cross-tenant data access

### File Uploads
- Product images and documents are uploaded to `storage/app/public/products`
- File type validation is enforced
- Maximum file size limits are configured in `php.ini`

### API Security
- API endpoints use Laravel Sanctum for authentication
- Rate limiting is applied to prevent abuse
- CORS is configured for allowed origins only

## Security Features

This application includes the following security features:

- ✅ CSRF Protection (Laravel default)
- ✅ SQL Injection Prevention (Eloquent ORM)
- ✅ XSS Protection (Blade template escaping)
- ✅ Password Hashing (Bcrypt)
- ✅ Role-Based Access Control (Spatie Laravel Permission)
- ✅ API Rate Limiting
- ✅ Secure Session Management
- ✅ Input Validation (Form Request classes)
- ✅ Payment Gateway Signature Verification
- ✅ Multi-Tenant Data Isolation

## Vulnerability Disclosure Timeline

- **Day 0**: Security vulnerability reported
- **Day 1-2**: Initial response and confirmation
- **Day 3-7**: Investigation and patch development
- **Day 8-14**: Testing and validation
- **Day 15**: Security release and public disclosure (if applicable)

## Bug Bounty Program

We currently do not have a bug bounty program. However, we greatly appreciate security researchers who responsibly disclose vulnerabilities.

## Hall of Fame

We thank the following security researchers for their responsible disclosure:

*No reports yet*

---

**Last Updated:** 2026-01-19
