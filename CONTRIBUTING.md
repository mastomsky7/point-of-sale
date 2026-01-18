# Contributing to Point of Sales System

First off, thank you for considering contributing to Point of Sales System! It's people like you that make this project such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots or animated GIFs if relevant**
- **Include your environment details** (OS, PHP version, Laravel version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed feature**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

- Fill in the required template
- Follow the coding standards
- Include appropriate test coverage
- Update documentation as needed
- Ensure all tests pass

## Development Setup

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 8.0
- Redis (optional but recommended)

### Installation

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/point-of-sales.git
   cd point-of-sales
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   # Configure your database in .env
   php artisan migrate --seed
   ```

5. **Build assets**
   ```bash
   npm run dev
   ```

6. **Run the application**
   ```bash
   php artisan serve
   ```

## Coding Standards

### PHP / Laravel

We follow **PSR-12** coding standards. Before submitting:

```bash
# Run Laravel Pint (code formatter)
./vendor/bin/pint

# Run static analysis (if available)
./vendor/bin/phpstan analyse
```

**Key principles:**

- Use type hints for all function parameters and return types
- Follow Laravel naming conventions
- Use dependency injection instead of facades when possible
- Keep controllers thin, use services for business logic
- Use Form Request classes for validation
- Use Eloquent relationships instead of manual queries

**Example:**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Services\ProductService;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = $this->productService->create($request->validated());

        return redirect()
            ->route('products.index')
            ->with('success', 'Product created successfully');
    }
}
```

### JavaScript / React

- Use **ES6+** syntax
- Follow **Airbnb React/JSX Style Guide**
- Use functional components with hooks
- Use meaningful variable and function names
- Add PropTypes or TypeScript types

**Example:**

```jsx
import { useState } from 'react';

export default function ProductForm({ onSubmit, initialData = null }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: 0,
        stock: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
}
```

### Database

- Use migrations for all schema changes
- Never edit existing migrations that are in version control
- Use seeders for test data
- Add indexes for foreign keys and frequently queried columns
- Use descriptive table and column names

### File Organization

```
app/
├── Console/Commands/          # Artisan commands
├── Http/
│   ├── Controllers/
│   │   ├── Api/              # API controllers
│   │   └── Apps/             # Application controllers
│   ├── Middleware/           # Custom middleware
│   └── Requests/             # Form request classes
├── Models/                   # Eloquent models
├── Services/                 # Business logic services
└── Traits/                   # Reusable traits

resources/
├── js/
│   ├── Components/           # Reusable React components
│   ├── Pages/                # Inertia page components
│   └── Utils/                # Utility functions
└── views/                    # Blade templates
```

## Commit Guidelines

We follow **Conventional Commits** specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(pos): add barcode scanner support

Added support for USB barcode scanners in the POS interface.
Scanners can now be used to quickly add products to cart.

Closes #123
```

```bash
fix(payments): resolve Midtrans webhook signature verification

Fixed issue where webhook signature validation was failing
for certain payment notifications from Midtrans.

Fixes #456
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   # Run tests
   php artisan test

   # Run code style checks
   ./vendor/bin/pint --test

   # Build frontend
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes
   - Request review from maintainers

### Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows project coding standards
- [ ] All tests pass (`php artisan test`)
- [ ] New features have test coverage
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow conventions
- [ ] No merge conflicts with main branch
- [ ] Code has been reviewed for security issues
- [ ] Database migrations are reversible

## Testing Guidelines

### Backend Testing

We use **PHPUnit** for testing. Tests should be:

- **Fast**: Tests should run quickly
- **Isolated**: Each test should be independent
- **Repeatable**: Same result every time
- **Self-validating**: Clear pass/fail

**Example:**

```php
<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class ProductTest extends TestCase
{
    public function test_user_can_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/dashboard/products', [
                'name' => 'Test Product',
                'price' => 10000,
                'stock' => 100,
            ]);

        $response->assertRedirect('/dashboard/products');
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
        ]);
    }
}
```

### Frontend Testing

Use **Jest** and **React Testing Library** for component tests:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ProductForm from './ProductForm';

test('submits form with correct data', () => {
    const handleSubmit = jest.fn();
    render(<ProductForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test Product' }
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Test Product',
        // ...
    });
});
```

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test tests/Feature/ProductTest.php
```

## Documentation

When adding new features:

- Update relevant `.md` files in the root directory
- Add inline code documentation (PHPDoc)
- Update API documentation (if applicable)
- Add examples in comments

## Questions?

Feel free to open an issue with the label `question` if you have any questions about contributing.

## Recognition

Contributors will be recognized in:

- GitHub contributors page
- CHANGELOG.md for significant contributions
- README.md contributors section (for major features)

---

Thank you for contributing! 🎉
