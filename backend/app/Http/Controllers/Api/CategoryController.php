<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Category::with('parent')->get();
        return CategoryResource::collection($categories);
    }

    /**
     * Store a newly created category in storage (Admin CRUD).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100',
            'parent_category_id' => 'nullable|integer|exists:categories,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        // Slugify input
        $slug = Str::slug($request->slug);
        
        // Enforce uniqueness
        if (Category::where('slug', $slug)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Category slug must be unique.'
            ], 409);
        }

        $category = Category::create([
            'name' => $request->name,
            'slug' => $slug,
            'parent_category_id' => $request->parent_category_id,
            'meta_title' => $request->meta_title ?? $request->name,
            'meta_description' => $request->meta_description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category)
        ], 201);
    }

    /**
     * Update category (Admin CRUD).
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100',
            'parent_category_id' => 'nullable|integer|exists:categories,id|different:id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $slug = Str::slug($request->slug);

        if (Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Category slug must be unique.'
            ], 409);
        }

        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'parent_category_id' => $request->parent_category_id,
            'meta_title' => $request->meta_title ?? $request->name,
            'meta_description' => $request->meta_description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category)
        ]);
    }

    /**
     * Remove the specified category from storage (Admin CRUD).
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Check if any product is using this category
        if ($category->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category. Products are currently mapped to this category.'
            ], 400);
        }

        // Check if any subcategory is using this category as parent
        if ($category->children()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category. Subcategories are mapped to this category.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ]);
    }
}
