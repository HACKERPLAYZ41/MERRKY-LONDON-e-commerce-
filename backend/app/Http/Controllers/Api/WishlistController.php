<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get wishlisted products list for authenticated customer
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $wishlist = Wishlist::with('product.images')
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $wishlist->map(function ($item) {
                $product = $item->product;
                $price = $product->discount_price !== null ? (float)$product->discount_price : (float)$product->price;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $price,
                    'discount_price' => $product->discount_price !== null ? (float)$product->discount_price : null,
                    'primary_image' => $product->images->first()?->image_url,
                    'rating' => (float)$product->rating,
                    'stock' => $product->stock
                ];
            })
        ]);
    }

    /**
     * Toggle wishlisted state of a product
     */
    public function toggle(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        $productId = (int)$request->product_id;

        $wish = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($wish) {
            $wish->delete();
            return response()->json([
                'success' => true,
                'status' => 'removed',
                'message' => 'Removed from wishlist',
                'product_id' => $productId
            ]);
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $productId
            ]);
            return response()->json([
                'success' => true,
                'status' => 'added',
                'message' => 'Added to wishlist',
                'product_id' => $productId
            ]);
        }
    }
}
