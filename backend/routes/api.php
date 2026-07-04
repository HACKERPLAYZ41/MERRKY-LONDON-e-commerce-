<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\SitemapController;
use App\Http\Controllers\Api\TicketController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1 (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // --- 1. Public Authentication Routes ---
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/admin-login', [AuthController::class, 'adminLogin']);
    Route::post('auth/admin-verify', [AuthController::class, 'adminVerify2fa']);

    // --- 2. Public Catalog & Sitemap Routes ---
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('reviews', [ReviewController::class, 'index']);
    Route::get('sitemap.xml', [SitemapController::class, 'index']);

    // --- 3. Cart Session Handling (Guest / Persistent backends) ---
    Route::get('cart', [CartController::class, 'get']);
    Route::post('cart/add', [CartController::class, 'add']);
    Route::put('cart/items/{itemId}', [CartController::class, 'update']);
    Route::delete('cart/items/{itemId}', [CartController::class, 'remove']);

    // --- 4. Authenticated Customer Actions (Requires Sanctum Token) ---
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/refresh', [AuthController::class, 'refresh']); // reissues token pair

        // Shipping Address Profile APIs
        Route::get('addresses', [AddressController::class, 'index']);
        Route::post('addresses', [AddressController::class, 'store']);

        // Wishlists
        Route::get('wishlist', [WishlistController::class, 'index']);
        Route::post('wishlist', [WishlistController::class, 'toggle']);

        // Merge Cart upon login
        Route::post('cart/merge', [CartController::class, 'merge']);

        // Review additions
        Route::post('reviews', [ReviewController::class, 'store']);

        // Checkout & Payment verifying APIs
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{id}/invoice', [OrderController::class, 'getInvoice']);
        Route::post('checkout', [OrderController::class, 'checkout']);
        Route::post('checkout/verify', [OrderController::class, 'verifyPayment']);

        // Support Tickets routes
        Route::get('tickets', [TicketController::class, 'index']);
        Route::post('tickets', [TicketController::class, 'store']);
        Route::get('tickets/{id}', [TicketController::class, 'show']);
        Route::post('tickets/{id}/reply', [TicketController::class, 'addReply']);
    });

    // --- 5. Non-Guessable Secure Admin Control Panel ---
    // Double guards: role=admin check + administrative activity audit logging
    Route::prefix('control-panel-x7k')
        ->middleware(['auth:sanctum', 'admin.auth', 'audit.log'])
        ->group(function () {
            // Dashboard & Auditing Lookups
            Route::get('dashboard-stats', [AdminController::class, 'stats']);
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);

            // Product CRUD Actions
            Route::post('products', [ProductController::class, 'store']);
            Route::put('products/{id}', [ProductController::class, 'update']);
            Route::delete('products/{id}', [ProductController::class, 'destroy']);
            Route::post('upload', [ProductController::class, 'uploadImage']); // uploads to public/uploads

            // Category CRUD Actions
            Route::post('categories', [CategoryController::class, 'store']);
            Route::put('categories/{id}', [CategoryController::class, 'update']);
            Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

            // Order Status modification
            Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);

            // Support Tickets Administration
            Route::get('tickets', [TicketController::class, 'adminIndex']);
            Route::put('tickets/{id}/status', [TicketController::class, 'adminUpdateStatus']);
        });
});
