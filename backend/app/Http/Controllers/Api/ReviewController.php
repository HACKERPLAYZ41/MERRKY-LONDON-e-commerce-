<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews list by product ID
     */
    public function index(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        $reviews = Review::with('user')
            ->where('product_id', $request->product_id)
            ->orderBy('created_at', 'DESC')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews->map(function ($rev) {
                return [
                    'id' => $rev->id,
                    'user_name' => $rev->user->name,
                    'rating' => $rev->rating,
                    'comment' => $rev->comment,
                    'created_at' => $rev->created_at->toDateTimeString()
                ];
            })
        ]);
    }

    /**
     * Store new review and recalculate aggregate product rating
     */
    public function store(StoreReviewRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $review = null;
        $avgRating = 0.0;

        \DB::transaction(function () use ($user, $validated, &$review, &$avgRating) {
            $review = Review::create([
                'product_id' => $validated['product_id'],
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            // Recalculate average rating
            $avgRating = round((float)Review::where('product_id', $validated['product_id'])->avg('rating'), 2);
            
            Product::where('id', $validated['product_id'])->update([
                'rating' => $avgRating
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'review' => [
                'id' => $review->id,
                'user_name' => $user->name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->toDateTimeString()
            ],
            'new_product_rating' => $avgRating
        ], 201);
    }
}
