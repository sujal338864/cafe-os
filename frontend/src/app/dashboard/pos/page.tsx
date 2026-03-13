'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { useCartStore } from '@/lib/store';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

export default function POSPage() {
  const { theme } = useTheme();
  const { items, addItem, removeItem, updateQty, clear, total } = useCartStore();
  const [products,   setProducts]   = useState<any[]>([]);
  const [customers,  setCustomers]  = useState<any[]>([]);
  const [search,     setSearch]     = useState('');
  const [customerId, setCustomerId] = useState('');
  const [payment,    setPayment]    = useState('CASH');
  const [discount,   setDiscount]   = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/customers'),
      ]);
      setProducts(pRes.data.products || pRes.data || []);
      setCustomers(cRes.data.customers || cRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = products.filter(p =>
    (p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())) &&
    p.stock > 0
  );

  const grandTotal = Math.max(0, total() - discount);

  const checkout = async () => {
    if (items.length === 0) { setError('Cart is empty'); return; }
    setProcessing(true); setError(''); setSuccess('');
    try {
      await api.post('/api/orders', {
        customerId: customerId || undefined,
        paymentMethod: payment,
        discount,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
      });
      clear();
      setCustomerId('');
      setDiscount(0);
      setSuccess('Order placed successfully!');
      load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to place order');
    } finally { setProcessing(false); }
  };

  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '9px 12px', fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div style={{ display: 'flex', gap: 18, height: 'calc(100vh - 110px)' }}>
      {/* Products Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 10 }}>New Sale</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products by name or SKU..." style={inp} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, alignContent: 'start' }}>
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: theme.textFaint }}>Loading products...</div>
          ) : filtered.map((p: any) => (
            <div key={p.id} onClick={() => addItem({ id: p.id, name: p.name, price: Number(p.price), stock: p.stock })}
              style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = theme.border)}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{fmt(p.price)}</div>
              <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 4 }}>Stock: {p.stock}</div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: theme.textFaint }}>No products found</div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div style={{ width: 320, flexShrink: 0, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${theme.border}`, fontWeight: 800, fontSize: 15, color: theme.text }}>
          Cart · {items.length} items
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textFaint, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
              Click products to add to cart
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: theme.textFaint }}>{fmt(item.price)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 24, height: 24, borderRadius: 6, background: theme.hover, border: `1px solid ${theme.border}`, color: theme.text, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: 6, background: theme.hover, border: `1px solid ${theme.border}`, color: theme.text, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, minWidth: 70, textAlign: 'right' }}>{fmt(item.price * item.quantity)}</div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: 2 }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 18px', borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={inp}>
            <option value="">Walk-in Customer</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 6 }}>
            {['CASH', 'CARD', 'CREDIT', 'BANK'].map(m => (
              <button key={m} onClick={() => setPayment(m)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: payment === m ? '#7c3aed' : theme.hover,
                border: `1px solid ${payment === m ? '#7c3aed' : theme.border}`,
                color: payment === m ? 'white' : theme.textMuted,
              }}>{m}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: theme.textFaint, whiteSpace: 'nowrap' }}>Discount (Rs.)</span>
            <input type="number" value={discount || ''} onChange={e => setDiscount(Number(e.target.value) || 0)} placeholder="0" style={{ ...inp, width: 'auto', flex: 1 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#7c3aed' }}>{fmt(grandTotal)}</span>
          </div>

          {error   && <div style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          {success && <div style={{ fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '8px 12px', borderRadius: 8 }}>{success}</div>}

          <button onClick={checkout} disabled={processing || items.length === 0} style={{
            width: '100%', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white',
            padding: 13, borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: processing || items.length === 0 ? 'not-allowed' : 'pointer',
            opacity: items.length === 0 ? 0.5 : 1,
          }}>{processing ? 'Processing...' : `Complete Sale · ${fmt(grandTotal)}`}</button>

          {items.length > 0 && (
            <button onClick={clear} style={{ width: '100%', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 12 }}>Clear Cart</button>
          )}
        </div>
      </div>
    </div>
  );
}
