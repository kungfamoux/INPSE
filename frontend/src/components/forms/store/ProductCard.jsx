import React from "react";
import { ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product, category, onAddToCart, onView }) {
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80";
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const displayPrice = hasDiscount ? product.sale_price : product.price;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="relative overflow-hidden cursor-pointer" onClick={onView}>
        <img
          src={image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            SALE
          </div>
        )}
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-full shadow">
            ⭐ Featured
          </div>
        )}
      </div>
      <div className="p-4">
        {category && <p className="text-xs text-orange-500 font-medium mb-1">{category}</p>}
        <h3
          className="font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors line-clamp-2 text-sm leading-snug"
          onClick={onView}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">₦{displayPrice?.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">₦{product.price?.toLocaleString()}</span>
          )}
        </div>
        <Button
          onClick={onAddToCart}
          className="w-full mt-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl text-sm h-9"
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart
        </Button>
      </div>
    </div>
  );
}