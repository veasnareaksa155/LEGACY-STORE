<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'price',
        'original_price',
        'description',
        'sizes',
        'colors',
        'color_images',
        'gallery',
        'image_url',
        'is_featured',
        'is_new',
        'stock',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
        'color_images' => 'array',
        'gallery' => 'array',
        'price' => 'float',
        'original_price' => 'float',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'stock' => 'integer',
    ];

    protected $appends = [
        'rating',
        'reviews_count',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->latest();
    }

    public function getRatingAttribute(): float
    {
        $avg = $this->reviews()->avg('rating');
        if ($avg) {
            return round((float) $avg, 1);
        }
        // Deterministic default rating based on product ID if no reviews yet
        return round(4.7 + (($this->id % 4) * 0.1), 1);
    }

    public function getReviewsCountAttribute(): int
    {
        $count = $this->reviews()->count();
        if ($count > 0) {
            return $count;
        }
        // Deterministic default reviews count based on product ID if no reviews yet
        return (($this->id * 23) % 180) + 24;
    }
}