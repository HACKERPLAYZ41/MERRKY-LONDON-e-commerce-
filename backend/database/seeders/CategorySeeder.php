<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Parent Categories
        DB::table('categories')->insert([
            [
                'id' => 1, 
                'name' => 'Men', 
                'slug' => 'men', 
                'parent_category_id' => null, 
                'meta_title' => 'Men\'s Fashion Catalog | MERRKY LONDON', 
                'meta_description' => 'Explore the finest London smart-casual designs for men. Premium shirts, tees, denim, and watches.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2, 
                'name' => 'Women', 
                'slug' => 'women', 
                'parent_category_id' => null, 
                'meta_title' => 'Women\'s Luxury Catalog | MERRKY LONDON', 
                'meta_description' => 'Luxury clothing collection for women. Elegant designer dresses, knit crop tops, and handbags.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3, 
                'name' => 'Kids', 
                'slug' => 'kids', 
                'parent_category_id' => null, 
                'meta_title' => 'Kids Designer Wear | MERRKY LONDON', 
                'meta_description' => 'Premium kids and toddler organic cotton lines designed in London.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4, 
                'name' => 'Accessories', 
                'slug' => 'accessories', 
                'parent_category_id' => null, 
                'meta_title' => 'Designer Fashion Accessories | MERRKY LONDON', 
                'meta_description' => 'Finish your outfit with premium leather handbags, straps, and watches. Est. 2026.',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        // Subcategories
        DB::table('categories')->insert([
            [
                'id' => 5, 
                'name' => 'Shirts', 
                'slug' => 'men-shirts', 
                'parent_category_id' => 1, 
                'meta_title' => 'Men\'s Premium Shirts | MERRKY LONDON', 
                'meta_description' => 'Tailored linen-blend and cotton smart-casual shirts for men.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 6, 
                'name' => 'T-Shirts', 
                'slug' => 'men-tshirts', 
                'parent_category_id' => 1, 
                'meta_title' => 'Men\'s Graphic Tees & T-Shirts | MERRKY LONDON', 
                'meta_description' => 'Premium oversized graphic tee selection for everyday street fashion.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 7, 
                'name' => 'Jeans', 
                'slug' => 'men-jeans', 
                'parent_category_id' => 1, 
                'meta_title' => 'Men\'s Relaxed Fit Jeans | MERRKY LONDON', 
                'meta_description' => 'Classic five-pocket straight-leg indigo denim jeans.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 8, 
                'name' => 'Dresses', 
                'slug' => 'women-dresses', 
                'parent_category_id' => 2, 
                'meta_title' => 'Women\'s Designer Dresses | MERRKY LONDON', 
                'meta_description' => 'Lightweight rayon A-line dresses and floral printed midi fits.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 9, 
                'name' => 'Tops & Tees', 
                'slug' => 'women-tops', 
                'parent_category_id' => 2, 
                'meta_title' => 'Women\'s Square Neck Tops | MERRKY LONDON', 
                'meta_description' => 'Fitted square-neck ribbed knit crop tops in white, beige, and black.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 10, 
                'name' => 'Handbags', 
                'slug' => 'accessories-handbags', 
                'parent_category_id' => 4, 
                'meta_title' => 'Luxury Leather Handbags | MERRKY LONDON', 
                'meta_description' => 'Spacious faux and genuine leather totes and shoulder bags.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 11, 
                'name' => 'Watches', 
                'slug' => 'accessories-watches', 
                'parent_category_id' => 4, 
                'meta_title' => 'Minimalist Leather Chronographs | MERRKY LONDON', 
                'meta_description' => 'Analog quartz watches with genuine leather straps and stainless steel frames.',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
