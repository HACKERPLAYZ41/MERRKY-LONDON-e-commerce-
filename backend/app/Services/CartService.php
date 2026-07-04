<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Str;

class CartService
{
    /**
     * Get or create a cart for a user or a guest token.
     */
    public function getOrCreateCart(?int $userId, ?string $guestToken): Cart
    {
        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId]);
        }

        if (empty($guestToken)) {
            $guestToken = Str::uuid()->toString();
        }

        return Cart::firstOrCreate(['guest_token' => $guestToken]);
    }

    /**
     * Add an item to the cart.
     */
    public function addItem(Cart $cart, int $productId, int $quantity, ?string $size, ?string $color): CartItem
    {
        $product = Product::findOrFail($productId);

        // Limit quantity to stock
        if ($product->stock < $quantity) {
            $quantity = $product->stock;
        }

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('size', $size)
            ->where('color', $color)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $quantity;
            if ($newQty > $product->stock) {
                $newQty = $product->stock;
            }
            $cartItem->update(['quantity' => $newQty]);
        } else {
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
                'size' => $size,
                'color' => $color,
            ]);
        }

        return $cartItem;
    }

    /**
     * Update item quantity in the cart.
     */
    public function updateItem(Cart $cart, int $itemId, int $quantity): ?CartItem
    {
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($itemId);
        $product = $item->product;

        if ($quantity <= 0) {
            $item->delete();
            return null;
        }

        if ($product->stock < $quantity) {
            $quantity = $product->stock;
        }

        $item->update(['quantity' => $quantity]);
        return $item;
    }

    /**
     * Remove an item from the cart.
     */
    public function removeItem(Cart $cart, int $itemId): void
    {
        CartItem::where('cart_id', $cart->id)->findOrFail($itemId)->delete();
    }

    /**
     * Merge guest cart items into a user's database cart upon login.
     */
    public function mergeCart(int $userId, string $guestToken): Cart
    {
        $userCart = $this->getOrCreateCart($userId, null);
        $guestCart = Cart::where('guest_token', $guestToken)->first();

        if ($guestCart) {
            foreach ($guestCart->items as $guestItem) {
                $userItem = CartItem::where('cart_id', $userCart->id)
                    ->where('product_id', $guestItem->product_id)
                    ->where('size', $guestItem->size)
                    ->where('color', $guestItem->color)
                    ->first();

                if ($userItem) {
                    $newQty = $userItem->quantity + $guestItem->quantity;
                    $product = $userItem->product;
                    if ($newQty > $product->stock) {
                        $newQty = $product->stock;
                    }
                    $userItem->update(['quantity' => $newQty]);
                    $guestItem->delete();
                } else {
                    $guestItem->update(['cart_id' => $userCart->id]);
                }
            }

            // Remove empty guest cart
            $guestCart->delete();
        }

        return $userCart;
    }

    /**
     * Get details of a cart including items and total price.
     */
    public function getCartDetails(Cart $cart): array
    {
        $items = $cart->items()->with('product.images')->get();
        $totalAmount = 0.00;

        $formattedItems = [];
        foreach ($items as $item) {
            $product = $item->product;
            $price = $product->discount_price !== null ? (float)$product->discount_price : (float)$product->price;
            $subtotal = $price * $item->quantity;
            $totalAmount += $subtotal;

            $primaryImage = $product->images->first()?->image_url ?? null;

            $formattedItems[] = [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => $price,
                'quantity' => $item->quantity,
                'size' => $item->size,
                'color' => $item->color,
                'image_url' => $primaryImage,
                'subtotal' => $subtotal,
            ];
        }

        return [
            'cart_id' => $cart->id,
            'guest_token' => $cart->guest_token,
            'items' => $formattedItems,
            'total_amount' => $totalAmount,
        ];
    }
}
