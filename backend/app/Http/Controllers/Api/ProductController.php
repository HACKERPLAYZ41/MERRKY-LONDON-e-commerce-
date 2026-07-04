<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the products with filters, sorting, and search.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images']);

        // Search Filter (Full-text index MATCH or LIKE fallback)
        if ($request->filled('search')) {
            $search = $request->input('search');
            // Fulltext search handles complex queries, fallback to LIKE search for partials
            $query->where(function ($q) use ($search) {
                $q->whereFullText(['name', 'description'], $search)
                  ->orWhere('name', 'LIKE', '%' . $search . '%');
            });
        }

        // Category Filter (Support matching direct parent or subcategory)
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $category = Category::where('slug', $categorySlug)->first();

            if ($category) {
                $categoryIds = Category::where('parent_category_id', $category->id)
                    ->pluck('id')
                    ->push($category->id)
                    ->toArray();

                $query->whereIn('category_id', $categoryIds);
            }
        }

        // Price Filters
        if ($request->filled('min_price')) {
            $minPrice = (float)$request->input('min_price');
            $query->where(function ($q) use ($minPrice) {
                $q->where(function ($sub) use ($minPrice) {
                    $sub->whereNotNull('discount_price')->where('discount_price', '>=', $minPrice);
                })->orWhere(function ($sub) use ($minPrice) {
                    $sub->whereNull('discount_price')->where('price', '>=', $minPrice);
                });
            });
        }

        if ($request->filled('max_price')) {
            $maxPrice = (float)$request->input('max_price');
            $query->where(function ($q) use ($maxPrice) {
                $q->where(function ($sub) use ($maxPrice) {
                    $sub->whereNotNull('discount_price')->where('discount_price', '<=', $maxPrice);
                })->orWhere(function ($sub) use ($maxPrice) {
                    $sub->whereNull('discount_price')->where('price', '<=', $maxPrice);
                });
            });
        }

        // Sizes Filter (Comma separated, e.g. S,M)
        if ($request->filled('sizes')) {
            $sizes = explode(',', $request->input('sizes'));
            $query->where(function ($q) use ($sizes) {
                foreach ($sizes as $size) {
                    $q->orWhere('sizes', 'LIKE', '%' . trim($size) . '%');
                }
            });
        }

        // Colors Filter
        if ($request->filled('colors')) {
            $colors = explode(',', $request->input('colors'));
            $query->where(function ($q) use ($colors) {
                foreach ($colors as $color) {
                    $q->orWhere('colors', 'LIKE', '%' . trim($color) . '%');
                }
            });
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(discount_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(discount_price, price) DESC');
                break;
            case 'rating':
                $query->orderBy('rating', 'DESC');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'DESC');
                break;
        }

        $perPage = (int)$request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * Show Product Detail by Slug
     */
    public function show($slug)
    {
        $product = Product::with(['category', 'images', 'reviews.user'])
            ->where('slug', $slug)
            ->first();

        // Fallback search by ID if slug not found (support backward compatibility)
        if (!$product && is_numeric($slug)) {
            $product = Product::with(['category', 'images', 'reviews.user'])->find($slug);
        }

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
            'reviews' => $product->reviews->map(function ($rev) {
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
     * Store new product (Admin CRUD)
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        
        // Generate clean unique slug
        $slug = Str::slug($validated['name']);
        $count = Product::where('slug', 'LIKE', $slug . '%')->count();
        if ($count > 0) {
            $slug = $slug . '-' . time();
        }

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'] ?? null,
            'sizes' => $validated['sizes'] ?? null,
            'colors' => $validated['colors'] ?? null,
            'meta_title' => $validated['meta_title'] ?? $validated['name'],
            'meta_description' => $validated['meta_description'] ?? null,
            'og_image' => $validated['og_image'] ?? null,
        ]);

        // Add images
        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $url) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $url
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => new ProductResource($product->load('images'))
        ], 201);
    }

    /**
     * Update product details (Admin CRUD)
     */
    public function update(StoreProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validated();

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'] ?? null,
            'sizes' => $validated['sizes'] ?? null,
            'colors' => $validated['colors'] ?? null,
            'meta_title' => $validated['meta_title'] ?? $validated['name'],
            'meta_description' => $validated['meta_description'] ?? null,
            'og_image' => $validated['og_image'] ?? null,
        ]);

        // Update images if provided
        if (isset($validated['images'])) {
            $product->images()->delete();
            foreach ($validated['images'] as $url) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $url
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => new ProductResource($product->load('images'))
        ]);
    }

    /**
     * Delete product (Admin CRUD)
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.'
        ]);
    }

    /**
     * Save uploaded file to public/uploads
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $fileName = uniqid('prod_', true) . '.' . $image->getClientOriginalExtension();
            
            // Move file to server directory public/uploads
            $image->move(public_path('uploads'), $fileName);
            
            $imageUrl = asset('uploads/' . $fileName);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully.',
                'image_url' => $imageUrl
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to upload image.'
        ], 400);
    }
}
