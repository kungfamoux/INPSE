import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove }) {
  const items = cart?.items || [];
  const total = items.reduce((s, i) => s + (i.unit_price * i.qty), 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            My Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.product_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                  {item.variant_label && <p className="text-xs text-gray-500">{item.variant_label}</p>}
                  <p className="text-sm font-bold text-orange-600 mt-1">₦{(item.unit_price * item.qty).toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onUpdateQty(idx, item.qty - 1)} className="w-6 h-6 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                    <button onClick={() => onUpdateQty(idx, item.qty + 1)} className="w-6 h-6 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => onRemove(idx)} className="ml-auto text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-orange-600">₦{total.toLocaleString()}</span>
            </div>
            <Link to={createPageUrl("StoreCheckout")} onClick={onClose}>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl h-11">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}