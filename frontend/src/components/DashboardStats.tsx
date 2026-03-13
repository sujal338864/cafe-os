"use client";

import { TrendingUp, ShoppingCart, Users, AlertCircle } from "lucide-react";

interface DashboardData {
  today?: { revenue: number; orders: number };
  month?: { revenue: number; orders: number; profit: number };
  totalCustomers?: number;
  lowStockProducts?: any[];
}

export function DashboardStats({ data }: { data?: DashboardData }) {
  const stats = [
    {
      label: "Revenue Today",
      value: `₹${(data?.today?.revenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "from-green-600 to-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Orders Today",
      value: data?.today?.orders || 0,
      icon: ShoppingCart,
      color: "from-blue-600 to-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Customers",
      value: data?.totalCustomers || 0,
      icon: Users,
      color: "from-purple-600 to-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Low Stock Items",
      value: data?.lowStockProducts?.length || 0,
      icon: AlertCircle,
      color: "from-orange-600 to-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-slate-900 rounded-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-white text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
