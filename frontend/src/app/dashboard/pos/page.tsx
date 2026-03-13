'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');
const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#7c3aed'];

const METHODS = [
  { value: 'CASH',          label: 'Cash',   icon: '💵' },
  { value: 'UPI',           label: 'UPI',    icon: '📱' },
  { value: 'CARD',          label: 'Card',   icon: '💳' },
  { value: 'BANK_TRANSFER', label: 'Bank',   icon: '🏦' },
  { value: 'CREDIT',        label: 'Credit', icon: '📝' },
];

type CartItem = {
  id: string; name: string; sellingPrice: number; costPrice: number;
  taxRate: number; qty: number; stock: number;
};
type Receipt = {
  invoiceNumber: string; items: CartItem[]; subtotal: number;
  taxBreakdown: { rate: number; amount: number }[];
  totalTax: number; discountAmount: number; total: number;
  method: string; customer: { id: string; name: string; phone?: string } | null;
  date: string; loyaltyPointsEarned: number;
};

// ── UPI QR Modal ─────────────────────────────────────────────────────────────
function UpiQrModal({ amount, onClose, onConfirm }: { amount: number; onClose: () => void; onConfirm: () => void }) {
  const { theme } = useTheme();
  // Generate UPI payment URL — replace upi_id with shop's actual UPI ID
  const upiId    = 'shopowner@upi';  // ← shopkeeper updates this in settings
  const upiUrl   = `upi://pay?pa=${upiId}&pn=Shop+OS&am=${amount.toFixed(2)}&cu=INR&tn=Sale+Payment`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: 32, width: 320, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 4 }}>UPI Payment</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#a78bfa', marginBottom: 16 }}>{fmt(amount)}</div>

        {/* QR Code */}
        <div style={{ background: 'white', borderRadius: 14, padding: 10, display: 'inline-block', marginBottom: 16 }}>
          <img src={qrApiUrl} alt="UPI QR" width={220} height={220} style={{ display: 'block', borderRadius: 8 }} />
        </div>

        <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 6 }}>Scan with any UPI app</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
            <span key={app} style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}>{app}</span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: theme.textFaint, marginBottom: 4 }}>UPI ID:</div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: theme.text, background: theme.hover, padding: '8px 14px', borderRadius: 8, marginBottom: 20 }}>{upiId}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onConfirm}
            style={{ flex: 1, background: '#10b981', border: 'none', color: 'white', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            ✓ Payment Received
          </button>
          <button onClick={onClose}
            style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '12px 16px', borderRadius: 10, cursor: 'pointer' }}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loyalty Points helper ─────────────────────────────────────────────────────
// 1 point per Rs.10 spent. 100 points = Rs.10 discount (1 point = Rs.0.10)
const POINTS_PER_RUPEE = 0.1;   // earn 1 point per Rs.10
const POINT_VALUE      = 0.10;  // 1 point = Rs.0.10 discount

// ─────────────────────────────────────────────────────────────────────────────

export default function POSPage() {
  const { theme } = useTheme();
  const [products,     setProducts]     = useState<any[]>([]);
  const [customers,    setCustomers]    = useState<any[]>([]);
  const [cart,         setCart]         = useState<CartItem[]>([]);
  const [search,       setSearch]       = useState('');
  const [method,       setMethod]       = useState('CASH');
  const [discount,     setDiscount]     = useState(0);
  const [customerId,   setCustomerId]   = useState('');
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [receipt,      setReceipt]      = useState<Receipt | null>(null);
  const [showUpiQr,    setShowUpiQr]    = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // New customer modal
  const [showNewCust, setShowNewCust] = useState(false);
  const [custForm,    setCustForm]    = useState({ name: '', phone: '' });
  const [custSaving,  setCustSaving]  = useState(false);
  const [custErr,     setCustErr]     = useState('');

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.allSettled([
        api.get('/api/products?limit=200'),
        api.get('/api/customers?limit=200'),
      ]);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data.products || []);
      if (cRes.status === 'fulfilled') {
        const d = cRes.value.data;
        setCustomers(d.customers || d || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addToCart = (p: any) => setCart(c => {
    const ex = c.find(i => i.id === p.id);
    if (ex) return c.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i);
    return [...c, { id: p.id, name: p.name, sellingPrice: Number(p.sellingPrice), costPrice: Number(p.costPrice || 0), taxRate: Number(p.taxRate || 0), qty: 1, stock: p.stock }];
  });
  const dec = (id: string) => setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  const inc = (id: string) => setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i));

  // ── Per-product tax calculation ─────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.sellingPrice * i.qty, 0);

  // Group tax by rate for itemised breakdown
  const taxGroups: Record<number, number> = {};
  cart.forEach(i => {
    const itemBase = i.sellingPrice * i.qty;
    const tax = itemBase * (i.taxRate / 100);
    if (tax > 0) taxGroups[i.taxRate] = (taxGroups[i.taxRate] || 0) + tax;
  });
  const taxBreakdown = Object.entries(taxGroups).map(([r, a]) => ({ rate: Number(r), amount: a }));
  const totalTax = taxBreakdown.reduce((s, t) => s + t.amount, 0);

  // Selected customer loyalty points
  const selectedCustomer = customers.find(c => c.id === customerId) || null;
  const availablePoints  = Number(selectedCustomer?.loyaltyPoints || 0);
  const pointsDiscount   = redeemPoints ? Math.min(availablePoints * POINT_VALUE, subtotal + totalTax) : 0;

  const discountAmt  = Math.min(discount, subtotal + totalTax) + pointsDiscount;
  const total        = Math.max(0, subtotal + totalTax - discountAmt);
  const pointsEarned = Math.floor(total * POINTS_PER_RUPEE);

  // ── Checkout ────────────────────────────────────────────────────────────
  const doCheckout = async () => {
    if (!cart.length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/orders', {
        customerId:     customerId || undefined,
        paymentMethod:  method,
        paymentStatus:  'PAID',
        discountAmount: discountAmt,
        items: cart.map(i => ({
          productId: i.id,
          name:      i.name,
          quantity:  i.qty,
          costPrice: i.costPrice,
          unitPrice: i.sellingPrice,
          taxRate:   i.taxRate,    // ← per-product tax rate sent to backend
          discount:  0,
        })),
      });

      const order = data.order || data;

      // Update customer loyalty points if applicable
      if (customerId) {
        const newPoints = availablePoints - (redeemPoints ? availablePoints : 0) + pointsEarned;
        api.put(`/api/customers/${customerId}`, { loyaltyPoints: newPoints }).catch(() => {});
      }

      setReceipt({
        invoiceNumber:     order.invoiceNumber,
        items:             [...cart],
        subtotal,
        taxBreakdown,
        totalTax:          Math.round(totalTax),
        discountAmount:    discountAmt,
        total:             Number(order.totalAmount ?? total),
        method,
        customer:          selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name, phone: selectedCustomer.phone } : null,
        date:              new Date().toISOString(),
        loyaltyPointsEarned: pointsEarned,
      });

      setCart([]); setCustomerId(''); setDiscount(0); setRedeemPoints(false);
      load();
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.error || e.response?.data?.details?.[0]?.message || 'Checkout failed'));
    } finally { setSubmitting(false); setShowUpiQr(false); }
  };

  const handleCharge = () => {
    if (!cart.length) return;
    if (method === 'UPI') { setShowUpiQr(true); }
    else { doCheckout(); }
  };

  // ── WhatsApp receipt ─────────────────────────────────────────────────────
  const sendWhatsApp = (r: Receipt) => {
    if (!r.customer?.phone) return;
    const itemLines = r.items.map(i => `  • ${i.name} x${i.qty} = ${fmt(i.sellingPrice * i.qty)}`).join('\n');
    const taxLines  = r.taxBreakdown.length > 0 ? '\n' + r.taxBreakdown.map(t => `  GST ${t.rate}%: ${fmt(t.amount)}`).join('\n') : '';
    const discLine  = r.discountAmount > 0 ? `\n  Discount: - ${fmt(r.discountAmount)}` : '';
    const pointsLine = r.loyaltyPointsEarned > 0 ? `\n🌟 Loyalty points earned: *+${r.loyaltyPointsEarned} pts*` : '';

    const text =
      `🧾 *Receipt — ${r.invoiceNumber}*\n` +
      `${new Date(r.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\n` +
      `*Items:*\n${itemLines}\n\n` +
      `Subtotal: ${fmt(r.subtotal)}${taxLines}${discLine}\n` +
      `*Total Paid: ${fmt(r.total)}* (${r.method})\n` +
      `${pointsLine}\n\n` +
      `_Thank you for shopping with us!_ 🙏`;

    window.open(`https://wa.me/92${r.customer.phone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Print receipt ────────────────────────────────────────────────────────
  const printBill = (r: Receipt) => {
    const html = receiptRef.current?.innerHTML;
    if (!html) return;
    const w = window.open('', '_blank', 'width=380,height=640');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Bill</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Courier New',monospace;font-size:12px;color:#000;background:#fff;padding:14px;max-width:300px;margin:0 auto}
      .center{text-align:center}.bold{font-weight:bold}
      .dash{border-top:1px dashed #000;margin:6px 0}
      .row{display:flex;justify-content:space-between;margin:2px 0}
      @media print{body{padding:0}}
    </style></head><body>${html}
    <script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  };

  const saveNewCustomer = async () => {
    if (!custForm.name.trim()) { setCustErr('Name is required'); return; }
    setCustSaving(true); setCustErr('');
    try {
      const { data } = await api.post('/api/customers', { name: custForm.name.trim(), phone: custForm.phone.trim() || undefined });
      const newC = data.customer || data;
      setCustomers(prev => [...prev, newC]);
      setCustomerId(newC.id);
      setShowNewCust(false);
      setCustForm({ name: '', phone: '' });
    } catch (e: any) {
      setCustErr(e.response?.data?.error || 'Failed');
    } finally { setCustSaving(false); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '9px 12px', fontSize: 13, width: '100%', outline: 'none' };

  // ── Receipt screen ────────────────────────────────────────────────────────
  if (receipt) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✅</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>Sale Complete!</div>
          <div style={{ fontSize: 13, color: theme.textFaint }}>Invoice #{receipt.invoiceNumber}</div>
        </div>
      </div>

      {/* Loyalty earned badge */}
      {receipt.loyaltyPointsEarned > 0 && receipt.customer && (
        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⭐</span>
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{receipt.customer.name} earned {receipt.loyaltyPointsEarned} loyalty points!</span>
        </div>
      )}

      {/* Bill */}
      <div style={{ background: '#fff', color: '#000', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', width: '100%', maxWidth: 310, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        <div ref={receiptRef}>
          <div style={{ textAlign: 'center', fontFamily: 'Courier New, monospace' }}>
            <div style={{ fontSize: 15, fontWeight: 'bold' }}>KIRANA KING</div>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{new Date(receipt.date).toLocaleString('en-IN')}</div>
            <div style={{ borderTop: '1px dashed #999', margin: '5px 0' }} />
          </div>
          {receipt.customer && (
            <div style={{ fontSize: 11, fontFamily: 'Courier New, monospace', marginBottom: 5 }}>
              <div><b>Customer:</b> {receipt.customer.name}</div>
              {receipt.customer.phone && <div><b>Phone:</b> {receipt.customer.phone}</div>}
            </div>
          )}
          <div style={{ borderTop: '1px dashed #999', margin: '5px 0' }} />
          {/* Items */}
          <div style={{ fontFamily: 'Courier New, monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: 3, marginBottom: 3 }}>
              <span style={{ flex: 1 }}>ITEM</span><span style={{ width: 28, textAlign: 'center' }}>QTY</span><span style={{ width: 70, textAlign: 'right' }}>AMT</span>
            </div>
            {receipt.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span style={{ flex: 1, overflow: 'hidden' }}>{item.name}</span>
                <span style={{ width: 28, textAlign: 'center' }}>{item.qty}</span>
                <span style={{ width: 70, textAlign: 'right' }}>{fmt(item.sellingPrice * item.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '5px 0' }} />
          {/* Totals */}
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Subtotal</span><span>{fmt(receipt.subtotal)}</span></div>
            {receipt.taxBreakdown.map(t => (
              <div key={t.rate} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: '#555' }}>
                <span>GST {t.rate}%</span><span>{fmt(t.amount)}</span>
              </div>
            ))}
            {receipt.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: '#555' }}><span>Discount</span><span>- {fmt(receipt.discountAmount)}</span></div>}
            <div style={{ borderTop: '1px dashed #999', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 14 }}><span>TOTAL</span><span>{fmt(receipt.total)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginTop: 2 }}><span>Payment</span><span>{receipt.method}</span></div>
            {receipt.loyaltyPointsEarned > 0 && <div style={{ marginTop: 6, textAlign: 'center', fontSize: 10, color: '#b45309' }}>⭐ +{receipt.loyaltyPointsEarned} loyalty points earned</div>}
          </div>
          <div style={{ borderTop: '1px dashed #999', margin: '5px 0' }} />
          <div style={{ textAlign: 'center', fontSize: 10, color: '#666', fontFamily: 'Courier New, monospace' }}>Thank you! Please visit again.</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => printBill(receipt)}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '11px 22px', borderRadius: 11, fontWeight: 700, cursor: 'pointer' }}>
          🖨️ Print Bill
        </button>
        {receipt.customer?.phone && (
          <button onClick={() => sendWhatsApp(receipt)}
            style={{ background: '#25D366', border: 'none', color: 'white', padding: '11px 22px', borderRadius: 11, fontWeight: 700, cursor: 'pointer' }}>
            📲 WhatsApp Receipt
          </button>
        )}
        <button onClick={() => setReceipt(null)}
          style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '11px 22px', borderRadius: 11, fontWeight: 600, cursor: 'pointer' }}>
          New Sale
        </button>
      </div>
    </div>
  );

  // ── Main POS ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 18, height: 'calc(100vh - 108px)' }}>

      {/* Products panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>New Sale</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ ...inp, width: 240 }} />
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textFaint }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
            {filtered.map((p: any, idx: number) => (
              <div key={p.id} onClick={() => addToCart(p)}
                style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'border-color .15s', opacity: p.stock <= 0 ? 0.5 : 1 }}
                onMouseEnter={e => { if (p.stock > 0) (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = theme.border}>
                <div style={{ width: '100%', aspectRatio: '1', background: COLORS[idx % COLORS.length] + '22', border: '1px solid ' + COLORS[idx % COLORS.length] + '44', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28, fontWeight: 900, color: COLORS[idx % COLORS.length] }}>{p.name[0].toUpperCase()}</span>
                  }
                </div>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, lineHeight: 1.3, color: theme.text }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#a78bfa', fontWeight: 800, fontSize: 13 }}>{fmt(p.sellingPrice)}</span>
                    {Number(p.taxRate) > 0 && <span style={{ fontSize: 10, color: theme.textFaint, marginLeft: 4 }}>+{p.taxRate}%</span>}
                  </div>
                  <span style={{ background: p.stock <= (p.lowStockAlert || 5) ? 'rgba(239,68,68,.2)' : 'rgba(16,185,129,.2)', color: p.stock <= (p.lowStockAlert || 5) ? '#ef4444' : '#10b981', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{p.stock}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ gridColumn: 'span 3', padding: 36, textAlign: 'center', color: theme.textFaint }}>No products found.</div>}
          </div>
        )}
      </div>

      {/* Cart panel */}
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.border}`, fontWeight: 700, fontSize: 14, color: theme.text }}>
          Bill {cart.length > 0 && <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 12 }}>({cart.length} items)</span>}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 13 }}>Tap a product to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: theme.textFaint }}>
                  {fmt(item.sellingPrice)}
                  {item.taxRate > 0 && <span style={{ color: '#f59e0b', marginLeft: 4 }}>+{item.taxRate}% GST</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: theme.hover, borderRadius: 7, padding: '3px 7px' }}>
                  <button onClick={() => dec(item.id)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 12, minWidth: 16, textAlign: 'center', color: theme.text }}>{item.qty}</span>
                  <button onClick={() => inc(item.id)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>+</button>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, minWidth: 58, textAlign: 'right' }}>{fmt(item.sellingPrice * item.qty)}</span>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 9 }}>

            {/* Customer selector */}
            <div style={{ display: 'flex', gap: 6 }}>
              <select value={customerId} onChange={e => { setCustomerId(e.target.value); setRedeemPoints(false); }} style={{ ...inp, flex: 1, fontSize: 12 }}>
                <option value="">Walk-in Customer</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}{c.loyaltyPoints ? ` ⭐${c.loyaltyPoints}pts` : ''}</option>
                ))}
              </select>
              <button onClick={() => { setShowNewCust(true); setCustErr(''); setCustForm({ name: '', phone: '' }); }}
                style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: '#7c3aed', padding: '0 10px', borderRadius: 9, fontWeight: 900, fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>+</button>
            </div>

            {/* Loyalty points redemption */}
            {customerId && availablePoints > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '8px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>⭐ {availablePoints} pts</span>
                  <span style={{ fontSize: 11, color: theme.textFaint, marginLeft: 6 }}>= {fmt(availablePoints * POINT_VALUE)} discount</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={redeemPoints} onChange={e => setRedeemPoints(e.target.checked)} />
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>Redeem</span>
                </label>
              </div>
            )}

            {/* Payment method */}
            <div style={{ display: 'flex', gap: 4 }}>
              {METHODS.map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)} style={{
                  flex: 1, padding: '6px 2px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  background: method === m.value ? '#7c3aed' : theme.hover,
                  border: `1px solid ${method === m.value ? '#7c3aed' : theme.border}`,
                  color: method === m.value ? 'white' : theme.textMuted,
                }}>{m.icon}<br />{m.label}</button>
              ))}
            </div>

            {/* Discount */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: theme.textFaint, whiteSpace: 'nowrap' }}>Discount Rs.</span>
              <input type="number" min="0" value={discount || ''} onChange={e => setDiscount(Number(e.target.value) || 0)}
                placeholder="0" style={{ ...inp, padding: '6px 10px', fontSize: 12 }} />
            </div>

            {/* Totals — per-product tax breakdown */}
            <div style={{ fontSize: 11, color: theme.textFaint }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              {taxBreakdown.map(t => (
                <div key={t.rate} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>GST {t.rate}%</span><span>{fmt(t.amount)}</span>
                </div>
              ))}
              {discountAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, color: '#10b981' }}><span>Discount</span><span>- {fmt(discountAmt)}</span></div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#7c3aed' }}>{fmt(total)}</span>
            </div>

            {/* Points earned preview */}
            {customerId && pointsEarned > 0 && (
              <div style={{ fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>⭐ Will earn {pointsEarned} loyalty points</div>
            )}

            <button onClick={handleCharge} disabled={submitting || cart.length === 0}
              style={{ width: '100%', background: method === 'UPI' ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: 13, borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Processing...' : method === 'UPI' ? `📱 Show QR · ${fmt(total)}` : `Charge ${fmt(total)}`}
            </button>

            <button onClick={() => setCart([])}
              style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textMuted, padding: 7, borderRadius: 9, cursor: 'pointer', fontSize: 12 }}>
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* UPI QR Modal */}
      {showUpiQr && (
        <UpiQrModal
          amount={total}
          onClose={() => setShowUpiQr(false)}
          onConfirm={doCheckout}
        />
      )}

      {/* New Customer Modal */}
      {showNewCust && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowNewCust(false)}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, width: '90%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>Add Customer</div>
              <button onClick={() => setShowNewCust(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            {custErr && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{custErr}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 5 }}>Name *</label>
                <input value={custForm.name} onChange={e => setCustForm(v => ({ ...v, name: e.target.value }))} placeholder="Customer name" style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 5 }}>Mobile <span style={{ fontWeight: 400, fontSize: 10, textTransform: 'none' as const }}>(optional)</span></label>
                <input value={custForm.phone} onChange={e => setCustForm(v => ({ ...v, phone: e.target.value }))} placeholder="03xx-xxxxxxx" style={inp} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={saveNewCustomer} disabled={custSaving}
                style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: custSaving ? 0.7 : 1 }}>
                {custSaving ? 'Saving...' : 'Add'}
              </button>
              <button onClick={() => setShowNewCust(false)}
                style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '12px 16px', borderRadius: 10, cursor: 'pointer' }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
