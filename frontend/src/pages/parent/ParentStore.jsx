import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductCard from "../components/store/ProductCard";
import CartDrawer from "../components/store/CartDrawer";
import ProductDetailModal from "../components/store/ProductDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Store } from "lucide-react";

export default function ParentStore({ currentUser }) {
  const qc = useQueryClient();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [viewProduct, setViewProduct] = useState(null);

  const { data: categories = [] } = useQuery({ queryKey: ["store-categories"], queryFn: () => base44.entities.StoreCategory.filter({ is_active: true }, "sort_order") });
  const { data: products = [] } = useQuery({ queryKey: ["store-products"], queryFn: () => base44.entities.StoreProduct.filter({ is_active: true }, "sort_order") });
  const { data: variants = [] } = useQuery({ queryKey: ["store-variants"], queryFn: () => base44.entities.StoreVariant.filter({ is_active: true }) });
  const { data: carts = [] } = useQuery({ queryKey: ["my-cart", currentUser?.email], queryFn: () => base44.entities.StoreCart.filter({ user_email: currentUser?.email }) });
  const myCart = carts[0];

  const upsertCart = useMutation({
    mutationFn: async (items) => {
      if (myCart?.id) return base44.entities.StoreCart.update(myCart.id, { items });
      return base44.entities.StoreCart.create({ user_email: currentUser?.email, items });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-cart", currentUser?.email] }),
  });

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const filtered = products.filter(p => {
    const matchCat = activeCat === "all" || p.category_id === activeCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (item) => {
    const existing = myCart?.items || [];
    const idx = existing.findIndex(i => i.product_id === item.product_id && i.variant_id === item.variant_id);
    let newItems;
    if (idx >= 0) {
      newItems = existing.map((i, n) => n === idx ? { ...i, qty: i.qty + item.qty } : i);
    } else {
      newItems = [...existing, item];
    }
    upsertCart.mutate(newItems);
    setCartOpen(true);
  };

  const handleUpdateQty = (idx, qty) => {
    if (qty <= 0) return handleRemove(idx);
    const newItems = (myCart?.items || []).map((i, n) => n === idx ? { ...i, qty } : i);
    upsertCart.mutate(newItems);
  };

  const handleRemove = (idx) => {
    const newItems = (myCart?.items || []).filter((_, n) => n !== idx);
    upsertCart.mutate(newItems);
  };

  const cartCount = (myCart?.items || []).reduce((s, i) => s + i.qty, 0);
  const productVariants = viewProduct ? variants.filter(v => v.product_id === viewProduct.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">School Store</h2>
            <p className="text-xs text-gray-400">Uniforms, books, stationery & more</p>
          </div>
        </div>
        <Button
          onClick={() => setCartOpen(true)}
          variant="outline"
          className="relative rounded-xl border-orange-200"
        >
          <ShoppingCart className="w-4 h-4 mr-1 text-orange-500" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCat === "all" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow" : "bg-white border text-gray-600 hover:border-orange-300"}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCat === cat.id ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow" : "bg-white border text-gray-600 hover:border-orange-300"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">No products available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              category={categoryMap[p.category_id]}
              onAddToCart={() => {
                const pVariants = variants.filter(v => v.product_id === p.id);
                if (pVariants.length > 0) {
                  setViewProduct(p);
                } else {
                  handleAddToCart({
                    product_id: p.id,
                    variant_id: null,
                    product_name: p.name,
                    variant_label: "",
                    image_url: p.images?.[0] || "",
                    unit_price: p.sale_price || p.price,
                    qty: 1,
                  });
                }
              }}
              onView={() => setViewProduct(p)}
            />
          ))}
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={myCart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
      />

      <ProductDetailModal
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        product={viewProduct}
        variants={productVariants}
        category={viewProduct ? categoryMap[viewProduct.category_id] : ""}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}