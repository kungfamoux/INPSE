import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "../components/portal/StatCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CreditCard, ShoppingBag, TrendingUp, Package } from "lucide-react";

export default function AdminStoreReports() {
  const { data: orders = [] } = useQuery({ queryKey: ["store-orders"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 1000) });
  const { data: payments = [] } = useQuery({ queryKey: ["store-payments"], queryFn: () => base44.entities.StorePayment.list("-created_date", 1000) });
  const { data: products = [] } = useQuery({ queryKey: ["store-products"], queryFn: () => base44.entities.StoreProduct.list() });

  const totalRevenue = payments.filter(p => p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["pending", "paid", "processing"].includes(o.status)).length;
  const fulfilledOrders = orders.filter(o => o.status === "fulfilled").length;

  // Monthly revenue from orders
  const monthlyMap = {};
  orders.forEach(o => {
    if (!o.created_date) return;
    const m = new Date(o.created_date).toLocaleString("default", { month: "short" });
    monthlyMap[m] = (monthlyMap[m] || 0) + (o.total || 0);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

  // Top products
  const productSales = {};
  orders.forEach(o => {
    o.items?.forEach(item => {
      productSales[item.product_name] = (productSales[item.product_name] || 0) + (item.qty || 0);
    });
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Store Reports</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="green" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} color="blue" />
        <StatCard title="Pending Orders" value={pendingOrders} icon={Package} color="orange" />
        <StatCard title="Fulfilled" value={fulfilledOrders} icon={CreditCard} color="purple" />
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Orders Value (₦)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
              <Bar dataKey="total" fill="url(#orange-gradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map(([name, qty], i) => (
              <div key={name} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${["bg-orange-500", "bg-pink-500", "bg-blue-500", "bg-green-500", "bg-purple-500"][i]}`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-1.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" style={{ width: `${Math.min(100, (qty / topProducts[0][1]) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-500">{qty} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}