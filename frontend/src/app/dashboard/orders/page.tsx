'use client';
import { useEffect, useState } from 'react';

type Product = {
  id: string; name: string; sellingPrice: number; description?: string;
  imageUrl?: string; category?: { name: string }; stock: number; taxRate: number;
};
type CartItem = Product & { qty: number; note: string };

const fmt = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN');
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { response: { data: err } };
  }
  return res.json();
}

export default function OrderPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [cart,       setCart]       = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activecat,  setActiveCat]  = useState('All');
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [step,       setStep]       = useState<'menu' | 'info' | 'done'>('menu');
  const [shopName,   setShopName]   = useState('Our Menu');

  // Customer info
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [table,   setTable]   = useState('');
  const [notes,   setNotes]   = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI'>('CASH');
  const [placing, setPlacing] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [noteFor, setNoteFor] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pData, sData] = await Promise.allSettled([
        apiFetch('/api/products?limit=200'),
        apiFetch('/api/shop'),
      ]);
      if (pData.status === 'fulfilled') {
        const prods: Product[] = pData.value.products || [];
        setProducts(prods.filter(p => p.stock > 0));
        const cats = ['All', ...Array.from(new Set(prods.map((p: Product) => p.category?.name).filter(Boolean) as string[]))];
        setCategories(cats);
      }
      if (sData.status === 'fulfilled') {
        setShopName(sData.value.shop?.name || sData.value.name || 'Our Menu');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addToCart = (p: Product) => setCart(c => {
    const ex = c.find(i => i.id === p.id);
    if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
    return [...c, { ...p, qty: 1, note: '' }];
  });
  const dec = (id: string) => setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  const inc = (id: string) => setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const setItemNote = (id: string, note: string) => setCart(c => c.map(i => i.id === id ? { ...i, note } : i));

  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * i.qty, 0);
  const taxAmt   = cart.reduce((s, i) => s + (i.sellingPrice * i.qty) * (i.taxRate / 100), 0);
  const total    = subtotal + taxAmt;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = products.filter(p => {
    const matchCat    = activecat === 'All' || p.category?.name === activecat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const placeOrder = async () => {
    if (!name.trim()) return;
    setPlacing(true);
    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName:  name.trim(),
          customerPhone: phone.trim() || undefined,
          tableNumber:   table.trim() || undefined,
          notes:         notes.trim() || undefined,
          paymentMethod: payMode,
          paymentStatus: 'PENDING',
          source:        'CUSTOMER_APP',
          items: cart.map(i => ({
            productId: i.id,
            name:      i.name,
            quantity:  i.qty,
            unitPrice: i.sellingPrice,
            costPrice: 0,
            taxRate:   i.taxRate,
            discount:  0,
          })),
        }),
      });
      setInvoice(data.order?.invoiceNumber || data.invoiceNumber || '');
      setStep('done');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to place order. Please try again.');
    } finally { setPlacing(false); }
  };

  const FONTS = `<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />`;

  // ── DONE ─────────────────────────────────────────────────────
  if (step === 'done') return (
    <div style={{ minHeight: '100vh', background: '#080c08', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 40, boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>✓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 }}>Order Placed!</h1>
        <p style={{ color: '#86efac', fontSize: 15, marginBottom: 4 }}>Thank you, <b style={{ color: '#f0fdf4' }}>{name}</b>!</p>
        {invoice && <p style={{ color: '#4ade80', fontSize: 13, marginBottom: 20 }}>Invoice #{invoice}</p>}
        <div style={{ background: '#0f1f0f', border: '1px solid #166534', borderRadius: 16, padding: 18, marginBottom: 20 }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < cart.length - 1 ? '1px solid #14532d' : 'none', color: '#dcfce7', fontSize: 14 }}>
              <span>{item.name} ×{item.qty}</span>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>{fmt(item.sellingPrice * item.qty)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #166534', fontWeight: 800, fontSize: 16, color: '#f0fdf4' }}>
            <span>Total</span><span style={{ color: '#4ade80' }}>{fmt(total)}</span>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#14532d', borderRadius: 8, color: '#86efac', fontSize: 13, textAlign: 'center' }}>
            {payMode === 'CASH' ? '💵 Pay at counter when ready' : '📱 Please complete UPI payment'}
          </div>
        </div>
        {table && <p style={{ color: '#86efac', fontSize: 14, marginBottom: 20 }}>🪑 Table <b style={{ color: '#f0fdf4' }}>{table}</b></p>}
        <button onClick={() => { setCart([]); setStep('menu'); setName(''); setPhone(''); setTable(''); setNotes(''); }}
          style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: 'white', padding: '14px 36px', borderRadius: 50, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Order More
        </button>
      </div>
    </div>
  );

  // ── INFO SCREEN ───────────────────────────────────────────────
  if (step === 'info') return (
    <div style={{ minHeight: '100vh', background: '#080c08', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a2e1a', display: 'flex', alignItems: 'center', gap: 12, background: '#0a0f0a', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setStep('menu')} style={{ background: '#1a2e1a', border: 'none', color: '#86efac', width: 36, height: 36, borderRadius: '50%', fontSize: 20, cursor: 'pointer' }}>←</button>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#f0fdf4' }}>Your Order</div>
      </div>

      <div style={{ padding: '20px 20px 100px' }}>
        {/* Cart summary */}
        <div style={{ background: '#0f1a0f', border: '1px solid #1a2e1a', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#4ade80', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 }}>Order Summary</div>
          {cart.map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0fdf4' }}>{item.name}</div>
                  {item.note && <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>📝 {item.note}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1a2e1a', borderRadius: 20, padding: '4px 10px' }}>
                    <button onClick={() => dec(item.id)} style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>−</button>
                    <span style={{ color: '#f0fdf4', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' as const }}>{item.qty}</span>
                    <button onClick={() => inc(item.id)} style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>+</button>
                  </div>
                  <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 14, minWidth: 56, textAlign: 'right' as const }}>{fmt(item.sellingPrice * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => setNoteFor(noteFor === item.id ? null : item.id)}
                style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 12, cursor: 'pointer', padding: '0 0 6px', opacity: 0.7 }}>
                {noteFor === item.id ? '▲ Hide note' : '+ Add note (e.g. less spice)'}
              </button>
              {noteFor === item.id && (
                <input value={item.note} onChange={e => setItemNote(item.id, e.target.value)} placeholder="e.g. less sugar, extra hot..."
                  style={{ width: '100%', background: '#1a2e1a', border: '1px solid #166534', borderRadius: 8, padding: '8px 12px', color: '#dcfce7', fontSize: 13, outline: 'none', marginBottom: 6, boxSizing: 'border-box' as const }} />
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1a2e1a', marginTop: 8, paddingTop: 10 }}>
            {taxAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#86efac', marginBottom: 4 }}><span>Tax</span><span>{fmt(Math.round(taxAmt))}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: '#f0fdf4' }}>
              <span>Total</span><span style={{ color: '#4ade80' }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ fontWeight: 700, fontSize: 12, color: '#4ade80', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>Your Details</div>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, marginBottom: 20 }}>
          {[
            { val: name, set: setName, ph: 'Your name *', type: 'text' },
            { val: phone, set: setPhone, ph: 'Phone number (optional)', type: 'tel' },
            { val: table, set: setTable, ph: 'Table number (optional)', type: 'text' },
          ].map((f, i) => (
            <input key={i} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} type={f.type}
              style={{ background: '#0f1a0f', border: '1px solid #1a2e1a', borderRadius: 10, padding: '12px 14px', color: '#f0fdf4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const }} />
          ))}
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special requests? (optional)" rows={2}
            style={{ background: '#0f1a0f', border: '1px solid #1a2e1a', borderRadius: 10, padding: '12px 14px', color: '#f0fdf4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' as const, resize: 'none' as const, fontFamily: 'inherit' }} />
        </div>

        {/* Payment */}
        <div style={{ fontWeight: 700, fontSize: 12, color: '#4ade80', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 10 }}>Payment</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ v: 'CASH', icon: '💵', label: 'Pay at Counter', sub: 'Cash when served' }, { v: 'UPI', icon: '📱', label: 'UPI Payment', sub: 'GPay / PhonePe' }].map(m => (
            <button key={m.v} onClick={() => setPayMode(m.v as 'CASH' | 'UPI')}
              style={{ background: payMode === m.v ? 'linear-gradient(135deg,#15803d,#166534)' : '#0f1a0f', border: `2px solid ${payMode === m.v ? '#22c55e' : '#1a2e1a'}`, borderRadius: 12, padding: '14px 12px', cursor: 'pointer', textAlign: 'left' as const }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f0fdf4' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 20px', background: '#080c08', borderTop: '1px solid #1a2e1a' }}>
        <button onClick={placeOrder} disabled={placing || !name.trim()}
          style={{ width: '100%', background: name.trim() ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#1a2e1a', border: 'none', color: name.trim() ? 'white' : '#4b5563', padding: '15px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
          {placing ? 'Placing Order...' : `Place Order · ${fmt(total)}`}
        </button>
      </div>
    </div>
  );

  // ── MENU SCREEN ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#080c08', fontFamily: 'DM Sans, sans-serif', paddingBottom: cartCount > 0 ? 90 : 20 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg,#0a1a0a,#080c08)', padding: '28px 20px 16px', textAlign: 'center', borderBottom: '1px solid #1a2e1a' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 26, boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>☕</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0fdf4', margin: '0 0 4px' }}>{shopName}</h1>
        <p style={{ fontSize: 13, color: '#86efac', margin: '0 0 14px' }}>Order fresh, pay easy</p>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..."
            style={{ width: '100%', background: '#0f1a0f', border: '1px solid #1a2e1a', borderRadius: 12, padding: '10px 14px 10px 38px', color: '#f0fdf4', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' as const, scrollbarWidth: 'none' as const }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              style={{ flexShrink: 0, padding: '6px 16px', borderRadius: 50, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: activecat === cat ? 'linear-gradient(135deg,#22c55e,#16a34a)' : '#0f1a0f', color: activecat === cat ? 'white' : '#86efac' }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ padding: '4px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4ade80' }}>Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4b5563' }}>No items found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {filtered.map((p, idx) => {
              const inCart = cart.find(i => i.id === p.id);
              const cols = ['#22c55e','#3b82f6','#f59e0b','#ec4899','#8b5cf6','#06b6d4'];
              const col = cols[idx % cols.length];
              return (
                <div key={p.id} style={{ background: '#0f1a0f', border: `1px solid ${inCart ? col + '66' : '#1a2e1a'}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ width: '100%', aspectRatio: '4/3' as any, background: col + '22', position: 'relative', overflow: 'hidden' }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: col }}>{p.name[0].toUpperCase()}</div>
                    }
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#f0fdf4', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: col }}>{fmt(p.sellingPrice)}</span>
                      {inCart ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#1a2e1a', borderRadius: 20, padding: '4px 9px' }}>
                          <button onClick={() => dec(p.id)} style={{ background: 'none', border: 'none', color: col, fontSize: 17, cursor: 'pointer', lineHeight: 1 }}>−</button>
                          <span style={{ color: '#f0fdf4', fontWeight: 800, fontSize: 13, minWidth: 14, textAlign: 'center' as const }}>{inCart.qty}</span>
                          <button onClick={() => inc(p.id)} style={{ background: 'none', border: 'none', color: col, fontSize: 17, cursor: 'pointer', lineHeight: 1 }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)}
                          style={{ background: col, border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart button */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 50 }}>
          <button onClick={() => setStep('info')}
            style={{ width: '100%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: 'white', padding: '15px 20px', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 30px rgba(34,197,94,0.45)' }}>
            <span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: 13 }}>{cartCount} items</span>
            <span>View Order</span>
            <span>{fmt(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}