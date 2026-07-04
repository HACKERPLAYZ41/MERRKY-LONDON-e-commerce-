<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    private $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Get cart details
     */
    public function get(Request $request)
    {
        $user = $request->user('sanctum');
        $guestToken = $request->header('X-Guest-Token') ?: $request->input('guest_token');

        $cart = $this->cartService->getOrCreateCart($user?->id, $guestToken);
        $details = $this->cartService->getCartDetails($cart);

        return response()->json([
            'success' => true,
            'data' => $details
        ]);
    }

    /**
     * Add item to cart
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'size' => 'nullable|string|max:20',
            'color' => 'nullable|string|max:50',
            'guest_token' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = $request->user('sanctum');
        $guestToken = $request->header('X-Guest-Token') ?: $request->input('guest_token');

        $cart = $this->cartService->getOrCreateCart($user?->id, $guestToken);
        $item = $this->cartService->addItem(
            $cart,
            (int)$request->product_id,
            (int)$request->quantity,
            $request->size,
            $request->color
        );

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart successfully.',
            'guest_token' => $cart->guest_token,
            'data' => $this->cartService->getCartDetails($cart)
        ]);
    }

    /**
     * Update item quantity in cart
     */
    public function update(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0',
            'guest_token' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = $request->user('sanctum');
        $guestToken = $request->header('X-Guest-Token') ?: $request->input('guest_token');

        $cart = $this->cartService->getOrCreateCart($user?->id, $guestToken);
        $this->cartService->updateItem($cart, (int)$itemId, (int)$request->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully.',
            'data' => $this->cartService->getCartDetails($cart)
        ]);
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request, $itemId)
    {
        $user = $request->user('sanctum');
        $guestToken = $request->header('X-Guest-Token') ?: $request->input('guest_token');

        $cart = $this->cartService->getOrCreateCart($user?->id, $guestToken);
        $this->cartService->removeItem($cart, (int)$itemId);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart successfully.',
            'data' => $this->cartService->getCartDetails($cart)
        ]);
    }

    /**
     * Merge guest cart into authenticated user cart
     */
    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'guest_token' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $cart = $this->cartService->mergeCart($user->id, $request->guest_token);
        
        return response()->json([
            'success' => true,
            'message' => 'Cart merged successfully.',
            'data' => $this->cartService->getCartDetails($cart)
        ]);
    }
}
