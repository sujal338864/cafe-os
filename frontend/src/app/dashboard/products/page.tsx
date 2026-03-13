'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

export default function ProductsPage() {
  const { theme } = useTheme();
  const [products,  setProducts]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState({ name: '', sku: '', price: '', costPrice: '', stock: '', minStock: '', categoryId: '', unit: 'PCS' });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => { load(); loadCats(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/api/products');
      setProducts(data.products || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadCats = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data.categories || data || []);
    } catch {}
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', sku: '', price: '', costPrice: '', stock: '', minStock: '5', categoryId: '', unit: 'PCS' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || '', price: p.price, costPrice: p.costPrice || '', stock: p.stock, minStock: p.minStock || '5', categoryId: p.categoryId || '', unit: p.unit || 'PCS' });
    setError('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await api.put(`/api/products/${editing.id}`, form);
      } else {
        await api.post('/api/products', form);
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/api/products/${id}`); load(); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed'); }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '10px 13px', fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>Products</h2>
          <p style={{ fontSize: 13, color: theme.textFaint, marginTop: 3 }}>{products.length} total products</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ ...inp, width: 220 }} />
          <button onClick={openAdd} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Product</button>
        </div>
      </div>

      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Product', 'SKU', 'Price', 'Cost', 'Stock', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{p.name}</div>
                    {p.category && <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{p.category.name}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: theme.textMuted }}>{p.sku || '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: theme.text }}>{fmt(p.price)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: theme.textMuted }}>{fmt(p.costPrice)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: Number(p.stock) <= Number(p.minStock || 5) ? '#f59e0b' : theme.text }}>{p.stock} {p.unit || 'PCS'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                      background: p.stock <= 0 ? 'rgba(239,68,68,0.15)' : p.stock <= (p.minStock || 5) ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: p.stock <= 0 ? '#ef4444' : p.stock <= (p.minStock || 5) ? '#f59e0b' : '#10b981',
                    }}>
                      {p.stock <= 0 ? 'Out of Stock' : p.stock <= (p.minStock || 5) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => del(p.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>No products found.</div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, width: '90%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>{editing ? 'Edit Product' : 'Add Product'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { l: 'Product Name *', k: 'name', full: true },
                { l: 'SKU', k: 'sku' },
                { l: 'Unit', k: 'unit' },
                { l: 'Sale Price *', k: 'price', type: 'number' },
                { l: 'Cost Price', k: 'costPrice', type: 'number' },
                { l: 'Stock Qty', k: 'stock', type: 'number' },
                { l: 'Min Stock Alert', k: 'minStock', type: 'number' },
              ].map(({ l, k, type, full }: any) => (
                <div key={k} style={full ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                  <input type={type || 'text'} value={(form as any)[k]} onChange={e => setForm((v: any) => ({ ...v, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              {categories.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Category</label>
                  <select value={form.categoryId} onChange={e => setForm(v => ({ ...v, categoryId: e.target.value }))} style={inp}>
                    <option value="">— None —</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}</button>
              <button onClick={() => setShowModal(false)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '12px 20px', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
