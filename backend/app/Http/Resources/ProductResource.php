<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float)$this->price,
            'discount_price' => $this->discount_price !== null ? (float)$this->discount_price : null,
            'stock' => $this->stock,
            'category_id' => $this->category_id,
            'category_name' => $this->category?->name,
            'sizes' => $this->sizes ? explode(',', $this->sizes) : [],
            'colors' => $this->colors ? explode(',', $this->colors) : [],
            'rating' => (float)$this->rating,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'og_image' => $this->og_image,
            'images' => $this->images->pluck('image_url')->toArray(),
            'primary_image' => $this->images->first()?->image_url,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
