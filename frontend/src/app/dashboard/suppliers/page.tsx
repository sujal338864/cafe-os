'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

export default function SuppliersPage() {
  const { theme } = useTheme();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState({ name: '', phone: '', email: '', address: '', contactPerson: '' });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/api/suppliers');
      setSuppliers(data.suppliers || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '', contactPerson: '' });
    setError(''); setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', contactPerson: s.contactPerson || '' });
    setError(''); setShowModal(true);
  };

  const save = async () => {
    if (!form.name) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/api/suppliers/${editing.id}`, form);
      else await api.post('/api/suppliers', form);
      setShowModal(false); load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this supplier?')) return;
    try { await api.delete(`/api/suppliers/${id}`); load(); }
    catch { alert('Failed to delete'); }
  };

  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '10px 13px', fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>Suppliers</h2>
          <p style={{ fontSize: 13, color: theme.textFaint, marginTop: 3 }}>{suppliers.length} suppliers</p>
        </div>
        <button onClick={openAdd} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Add Supplier</button>
      </div>

      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Supplier', 'Contact Person', 'Phone', 'Email', 'Outstanding', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'white', flexShrink: 0 }}>{s.name[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: theme.textMuted }}>{s.contactPerson || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: theme.textMuted }}>{s.phone || '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: theme.textMuted }}>{s.email || '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: Number(s.outstandingBalance) > 0 ? '#f59e0b' : '#10b981' }}>
                    {Number(s.outstandingBalance) > 0 ? fmt(s.outstandingBalance) : 'Cleared'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(s)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => del(s.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && suppliers.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>No suppliers yet.</div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, width: '90%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>{editing ? 'Edit Supplier' : 'Add Supplier'}</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ l: 'Supplier Name *', k: 'name' }, { l: 'Contact Person', k: 'contactPerson' }, { l: 'Phone', k: 'phone' }, { l: 'Email', k: 'email' }, { l: 'Address', k: 'address' }].map(({ l, k }) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                  <input value={(form as any)[k]} onChange={e => setForm((v: any) => ({ ...v, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Supplier'}</button>
              <button onClick={() => setShowModal(false)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '12px 20px', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
