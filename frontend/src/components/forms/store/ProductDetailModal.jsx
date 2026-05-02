import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductDetailModal({ product, variants, category, open, onClose, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const images = product?.images?.length ? product.images : ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"];
  const hasDiscount = product?.sale_price && product.sale_price < product.price;
  const displayPrice = (hasDiscount ? product.sale_price : product.price) + (selectedVariant?.extra_price || 0);

  // Group variants by variant_name
  const variantGroups = variants.reduce((acc, v) => {
    if (!acc[v.variant_name]) acc[v.variant_name] = [];
    acc[v.variant_name].push(v);
    return acc;
  }, {});

  const handleAdd = () => {
    onAddToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      product_name: product.name,
      variant_label: selectedVariant ? `${selectedVariant.variant_name}: ${selectedVariant.option}` : "",
      image_url: images[0],
      unit_price: displayPrice,
      qty,
    });
    onClose();
    setQty(1);
    setSelectedVariant(null);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Image */}
          <div>
            <div className="relative rounded-xl overflow-hidden">
              <img src={images[imgIdx]} alt={product.name} className="w-full h-64 object-cover" />
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
                  <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} className="bg-white/80 rounded-full p-1"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))} className="bg-white/80 rounded-full p-1"><ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 ${i === imgIdx ? "border-orange-500" : "border-transparent"}`} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {category && <Badge className="bg-orange-100 text-orange-700">{category}</Badge>}
            <div>
              <span className="text-2xl font-bold text-gray-900">₦{displayPrice?.toLocaleString()}</span>
              {hasDiscount && <span className="ml-2 text-gray-400 line-through text-sm">₦{product.price?.toLocaleString()}</span>}
            </div>
            {product.description && <p className="text-sm text-gray-500">{product.description}</p>}

            {Object.entries(variantGroups).map(([groupName, opts]) => (
              <div key={groupName}>
                <p className="text-sm font-semibold text-gray-700 mb-2">{groupName}</p>
                <div className="flex flex-wrap gap-2">
                  {opts.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      disabled={v.stock_qty <= 0}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?.id === v.id
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-orange-300"
                      } ${v.stock_qty <= 0 ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                    >
                      {v.option}
                      {v.extra_price > 0 && <span className="text-xs ml-1">(+₦{v.extra_price})</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-gray-700">Quantity</p>
              <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">−</button>
                <span className="w-8 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">+</button>
              </div>
            </div>

            {variants.length > 0 && !selectedVariant && (
              <p className="text-xs text-amber-600 flex items-center gap-1"><Package className="w-3 h-3" /> Please select a variant</p>
            )}

            <Button
              onClick={handleAdd}
              disabled={variants.length > 0 && !selectedVariant}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl h-11"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart · ₦{(displayPrice * qty).toLocaleString()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}