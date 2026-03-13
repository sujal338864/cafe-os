'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

const STATUS_COLORS: any = {
  COMPLETED: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  PENDING:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  CANCELLED: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  REFUNDED:  { bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
};

export default function OrdersPage() {
  const { theme } = useTheme();
  const [orders,   setOrders]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter,   setFilter]   = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/api/orders');
      setOrders(data.orders || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      load();
      if (selected?.id === id) setSelected((o: any) => ({ ...o, status }));
    } catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>Orders</h2>
          <p style={{ fontSize: 13, color: theme.textFaint, marginTop: 3 }}>{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${theme.border}`,
              background: filter === s ? '#7c3aed' : theme.hover,
              color: filter === s ? 'white' : theme.textMuted,
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => {
                const sc = STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                return (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#7c3aed', fontWeight: 700 }}>#{o.orderNumber || o.id?.slice(0, 8)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: theme.text }}>{o.customer?.name || 'Walk-in'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: theme.textMuted }}>{o.items?.length || o._count?.items || 0}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: theme.text }}>{fmt(o.total)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: theme.textMuted }}>{o.paymentMethod || 'CASH'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: sc.bg, color: sc.color }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: theme.textFaint }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => setSelected(o)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>No orders found.</div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>Order #{selected.orderNumber || selected.id?.slice(0, 8)}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { l: 'Customer', v: selected.customer?.name || 'Walk-in' },
                { l: 'Payment', v: selected.paymentMethod || 'CASH' },
                { l: 'Total', v: fmt(selected.total) },
                { l: 'Date', v: new Date(selected.createdAt).toLocaleString() },
              ].map(({ l, v }) => (
                <div key={l} style={{ background: theme.hover, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.items?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Items</div>
                {selected.items.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: 13, color: theme.text }}>{item.product?.name || item.name} × {item.quantity}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{fmt(item.total || item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateStatus(selected.id, 'COMPLETED')} style={{ flex: 1, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: 11, borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Mark Completed</button>
                <button onClick={() => updateStatus(selected.id, 'CANCELLED')} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: 11, borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Cancel Order</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
