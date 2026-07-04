<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Slim Fit Linen Blend Shirt',
                'slug' => 'slim-fit-linen-blend-shirt',
                'description' => 'A classic linen-blend shirt tailored in a slim fit, featuring a standard collar and button-up front. Perfect for summer smart-casual styles.',
                'price' => 1899.00,
                'discount_price' => 1499.00,
                'stock' => 25,
                'category_id' => 5,
                'sizes' => 'S,M,L,XL',
                'colors' => 'Navy Blue,White,Olive Green',
                'rating' => 4.5,
                'meta_title' => 'Slim Fit Linen Blend Shirt - Men\'s smart shirts | MERRKY LONDON',
                'meta_description' => 'Buy our lightweight Linen Blend Shirt in Navy, White, and Olive. High-breathability slim fit cut.',
                'og_image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Oversized Graphic Printed Tee',
                'slug' => 'oversized-graphic-printed-tee',
                'description' => 'Streetwear-inspired oversized cotton graphic t-shirt. Soft feel, durable print on chest and back.',
                'price' => 999.00,
                'discount_price' => 799.00,
                'stock' => 45,
                'category_id' => 6,
                'sizes' => 'M,L,XL',
                'colors' => 'Black,Sage Green',
                'rating' => 4.2,
                'meta_title' => 'Oversized Graphic Printed Tee - Streetwear Tees | MERRKY LONDON',
                'meta_description' => 'Streetwear graphic t-shirt for daily comfort. 100% thick premium carded cotton.',
                'og_image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Relaxed Straight Fit Jeans',
                'slug' => 'relaxed-straight-fit-jeans',
                'description' => 'Classic 100% cotton denim straight-leg jeans with mild wash and five pockets. Timeless look.',
                'price' => 2999.00,
                'discount_price' => 2499.00,
                'stock' => 15,
                'category_id' => 7,
                'sizes' => '30,32,34,36',
                'colors' => 'Light Blue,Dark Indigo',
                'rating' => 4.7,
                'meta_title' => 'Relaxed Straight Fit Indigo Denim | MERRKY LONDON',
                'meta_description' => 'Premium straight fit wash jeans in Light Blue and Dark Indigo. Five pocket rivet classic layout.',
                'og_image' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'name' => 'Floral Print A-Line Midi Dress',
                'slug' => 'floral-print-a-line-midi-dress',
                'description' => 'Elegant A-line floral printed dress featuring short puff sleeves and a side slit. Lightweight rayon fabric.',
                'price' => 2499.00,
                'discount_price' => 1999.00,
                'stock' => 8,
                'category_id' => 8,
                'sizes' => 'XS,S,M,L',
                'colors' => 'Red Floral,Yellow Floral',
                'rating' => 4.4,
                'meta_title' => 'Floral A-Line Rayon Midi Dress | MERRKY LONDON',
                'meta_description' => 'Short puff sleeve summer floral dress with side leg slit. Soft lightweight drape rayon.',
                'og_image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 5,
                'name' => 'Ribbed Knit Square Neck Crop Top',
                'slug' => 'ribbed-knit-square-neck-crop-top',
                'description' => 'Fitted stretch knit crop top featuring a sophisticated square neckline and thick ribbed knit texture.',
                'price' => 899.00,
                'discount_price' => 699.00,
                'stock' => 30,
                'category_id' => 9,
                'sizes' => 'XS,S,M,L',
                'colors' => 'White,Beige,Black',
                'rating' => 4.0,
                'meta_title' => 'Ribbed Knit Square Neck Crop Top | MERRKY LONDON',
                'meta_description' => 'Fitted stretch square crop top in essential colors. Ribbed texture cotton knit blend.',
                'og_image' => 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 6,
                'name' => 'Minimalist Leather Strap Watch',
                'slug' => 'minimalist-leather-strap-watch',
                'description' => 'Analog watch with white dial, silver-tone stainless steel case, and a genuine brown leather strap.',
                'price' => 4500.00,
                'discount_price' => 3999.00,
                'stock' => 12,
                'category_id' => 11,
                'sizes' => 'One Size',
                'colors' => 'Brown Leather,Black Leather',
                'rating' => 4.8,
                'meta_title' => 'Minimalist Analog Watch with Leather Strap | MERRKY LONDON',
                'meta_description' => 'Analogue white dial wrist watch. Silver-tone steel with genuine leather straps.',
                'og_image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 7,
                'name' => 'Faux Leather Shoulder Tote',
                'slug' => 'faux-leather-shoulder-tote',
                'description' => 'Spacious faux leather tote bag with zip closure, inner pockets, and comfortable shoulder straps.',
                'price' => 2200.00,
                'discount_price' => 1799.00,
                'stock' => 5,
                'category_id' => 10,
                'sizes' => 'One Size',
                'colors' => 'Black,Tan',
                'rating' => 4.3,
                'meta_title' => 'Spacious Faux Leather Shoulder Tote Bag | MERRKY LONDON',
                'meta_description' => 'Carry your laptop and keys in our elegant, spacious shoulder tote. Zip closure and interior pocket division.',
                'og_image' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('products')->insert($products);

        // Product Images
        DB::table('product_images')->insert([
            ['product_id' => 1, 'image_url' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 2, 'image_url' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 3, 'image_url' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 4, 'image_url' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 5, 'image_url' => 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 6, 'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['product_id' => 7, 'image_url' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 'created_at' => now(), 'updated_at' => now()]
        ]);
    }
}
