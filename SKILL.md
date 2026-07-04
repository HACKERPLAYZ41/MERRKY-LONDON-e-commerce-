---
name: ecommerce-backend
description: Use this skill whenever the user asks to build, structure, review, or harden a backend for an e-commerce / marketplace app (Myntra, Amazon, Flipkart style) — especially PHP/Laravel + MySQL backends, but the checklist generalizes to Node/Django too. Trigger this for requests about product CRUD APIs, cart/checkout/payment (Razorpay/Stripe) integration, admin panel APIs, admin panel security, rate limiting, input validation, API key handling, SEO for product/category pages, or folder structure for a production-grade shopping backend. Make sure to consult this even if the user only mentions one piece (e.g. "add rate limiting" or "how should I structure my Laravel backend") since these pieces are meant to work together.
---

# E-commerce Backend Skill

Use this as a checklist/reference when designing or reviewing an e-commerce backend (Laravel/PHP + MySQL is the default stack assumed here, but the same shape applies to Node/Express or Django).

## 1. Folder / Project Structure (Laravel example)

```
app/
  Http/
    Controllers/Api/   -> ProductController, CategoryController, OrderController,
                           AuthController, CartController, PaymentController, AdminController
    Middleware/         -> AdminAuth, ThrottleRequests, ValidateApiKey
    Requests/           -> One Form Request per write action (StoreProductRequest, CheckoutRequest...)
    Resources/          -> API Resource classes for consistent JSON shape
  Models/                -> User, Product, Category, Order, OrderItem, Cart, CartItem, Review, Wishlist, Address
  Services/              -> PaymentService, InventoryService, OrderService (business logic lives here, NOT in controllers)
  Repositories/          -> Optional but preferred for clean data access (ProductRepository, OrderRepository)
routes/api.php            -> versioned routes: /api/v1/...
database/migrations/      -> one migration per table, never edit prod schema by hand
database/seeders/         -> sample categories + products for testing
config/                   -> services.php (payment keys), cors.php
```

Rule of thumb: controllers stay thin (validate -> call service -> return resource). Business logic (price calculation, stock deduction, payment verification) belongs in Services, not Controllers.

## 2. Core Data Model

Minimum tables: `users`, `addresses`, `categories`, `products`, `product_images`, `carts`/`cart_items`, `orders`, `order_items`, `reviews`, `wishlists`, `audit_logs`.

Guest carts should be session/token-backed and merge into the DB cart on login — don't force login just to add to cart.

## 3. Cart & Checkout Flow

1. Add/update/remove cart items -> recalc totals server-side (never trust a price sent from the frontend).
2. On checkout: validate cart & stock -> create `orders` row (status=pending) -> create payment-gateway order (e.g. Razorpay order) -> return payment session to frontend.
3. On payment callback/webhook: **verify the signature server-side** using the gateway's SDK. Never mark an order paid just because the frontend says so.
4. On verified success: update order status, decrement stock, clear cart, trigger confirmation email/notification.
5. Handle failure/timeout paths explicitly (don't leave orders stuck in "pending" forever — add a cleanup job).

## 4. Payment Gateway Integration (Razorpay/Stripe)

- Use the official SDK, keys only in `.env`, never hard-coded, never shipped to frontend bundle.
- Only the **public/checkout key** goes to the client; the **secret key** stays server-side only.
- Always verify payment signature/webhook server-side before trusting a payment.
- Log payment attempts (success and failure) for reconciliation/support.

## 5. Admin Panel Security

- Admin routes protected by role-check middleware on **every** request server-side — a frontend route guard alone is not security.
- Prefer a non-obvious admin path or IP allowlist for extra obscurity (not a substitute for real auth).
- Hash passwords with bcrypt/argon2 (framework default, e.g. Laravel's built-in hashing).
- Use short-lived tokens (JWT/Sanctum) + refresh tokens; consider 2FA (email/SMS OTP) for admin login.
- Maintain an `audit_logs` table: who added/edited/deleted what, and when — critical for e-commerce admin panels.

## 6. General Security Hardening (apply as a pass after core features work)

When asked to "harden security" or similar, apply all of these together and confirm existing functionality (cart, checkout, admin CRUD) still works afterward:

1. **Rate limiting** on all public endpoints — IP-based and user-based, sensible defaults, return 429 with a `Retry-After` header, not a silent block.
2. **Input validation & sanitization** — schema-based (Form Requests in Laravel), type-check every field, enforce length limits, reject unexpected/extra fields rather than silently ignoring them.
3. **Secrets management** — no hard-coded API keys/DB credentials anywhere in code; everything in `.env` (gitignored); rotate any key that was ever committed or exposed; confirm secret keys never appear in any client-side bundle or API response.
4. Follow OWASP Top 10: parameterized queries only (no raw string-concatenated SQL), CSRF protection on state-changing routes, output escaping to prevent XSS, secure session/cookie flags, proper CORS config (don't wildcard `*` in production).
5. Comment security-relevant code clearly so future maintainers understand *why*, not just *what*.

## 7. SEO (for the storefront the backend serves)

- Slugs, not IDs, in product/category URLs (`/product/red-cotton-kurta-women`).
- Backend returns `meta_title`, `meta_description`, `og_image` per product/category so the frontend can set them dynamically.
- Expose a `sitemap.xml` endpoint generated from live product/category data.
- Flag to the user: a pure client-side-rendered React SPA is weak for SEO. For real production SEO on the storefront, recommend Next.js (SSR/SSG) or at minimum a prerendering/meta-injection strategy — mention this even if the current stack is plain React.

## 8. Dev → Production Migration Note (cPanel → VPS)

- Laravel runs on both cPanel (shared hosting, needs `public/` as document root or an `.htaccess` redirect, Composer support required) and VPS (Nginx + PHP-FPM + MySQL, full control, proper cron for Laravel's scheduler/queues).
- Because config lives in `.env`, moving from cPanel to VPS should only require updating `.env` values (DB host, `APP_URL`, keys) — not code changes, if the app was built cleanly per this skill.

## 9. When reviewing existing code against this skill

Check in this order: (1) are secrets hard-coded anywhere? (2) is every write endpoint validated? (3) is payment verified server-side? (4) are admin routes actually protected server-side? (5) is rate limiting present? (6) is SEO data exposed for the storefront? Report gaps found before making changes, then fix incrementally without breaking existing flows.
