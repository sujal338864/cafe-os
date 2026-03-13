'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

const StatCard = ({ label, value, sub, color, icon }: any) => {
  const { theme } = useTheme();
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: theme.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: theme.textFaint }}>{sub}</div>}
    </div>
  );
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const [stats,    setStats]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/api/analytics/dashboard').catch(() => ({ data: {} })),
        api.get('/api/orders?limit=5').catch(() => ({ data: { orders: [] } })),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const chartData = stats?.salesChart || [
    { name: 'Mon', sales: 0 }, { name: 'Tue', sales: 0 }, { name: 'Wed', sales: 0 },
    { name: 'Thu', sales: 0 }, { name: 'Fri', sales: 0 }, { name: 'Sat', sales: 0 }, { name: 'Sun', sales: 0 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: theme.textMuted, fontSize: 14 }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Today's Sales"    value={fmt(stats?.todaySales)}    sub={`${stats?.todayOrders || 0} orders`}      color="#3b82f6" icon="💰" />
        <StatCard label="Monthly Revenue"  value={fmt(stats?.monthRevenue)}  sub="This month"                               color="#10b981" icon="📈" />
        <StatCard label="Total Products"   value={stats?.totalProducts || 0} sub={`${stats?.lowStock || 0} low stock`}      color="#a78bfa" icon="📦" />
        <StatCard label="Total Customers"  value={stats?.totalCustomers || 0} sub="Registered"                             color="#06b6d4" icon="👥" />
        <StatCard label="Pending Orders"   value={stats?.pendingOrders || 0} sub="Awaiting fulfillment"                    color="#f59e0b" icon="🕐" />
        <StatCard label="Total Expenses"   value={fmt(stats?.monthExpenses)} sub="This month"                              color="#ef4444" icon="💸" />
      </div>

      {/* Chart */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 18 }}>Sales This Week</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.textFaint }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: theme.textFaint }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v}`} />
            <Tooltip
              contentStyle={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, fontSize: 12 }}
              formatter={(v: any) => [fmt(v), 'Sales']}
            />
            <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={2} fill="url(#salesGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Recent Orders</span>
          <a href="/dashboard/orders" style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>View all →</a>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: theme.textFaint, fontSize: 13 }}>No orders yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o: any) => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: '#7c3aed', fontWeight: 700 }}>#{o.orderNumber || o.id?.slice(0,8)}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: theme.text }}>{o.customer?.name || 'Walk-in'}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: theme.text }}>{fmt(o.total)}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                      background: o.status === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : o.status === 'PENDING' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                      color: o.status === 'COMPLETED' ? '#10b981' : o.status === 'PENDING' ? '#f59e0b' : '#64748b',
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: theme.textFaint }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
