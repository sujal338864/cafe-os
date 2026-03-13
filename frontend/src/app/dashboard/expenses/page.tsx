'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

const fmt = (n: any) => 'Rs.' + Number(n || 0).toLocaleString('en-IN');

const CATEGORIES = ['Rent', 'Utilities', 'Salaries', 'Inventory', 'Transport', 'Marketing', 'Maintenance', 'Other'];

export default function ExpensesPage() {
  const { theme } = useTheme();
  const [expenses,  setExpenses]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ title: '', amount: '', category: 'Other', description: '', date: new Date().toISOString().slice(0, 10) });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/api/expenses');
      setExpenses(data.expenses || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!form.title || !form.amount) { setError('Title and amount are required'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/api/expenses', form);
      setShowModal(false);
      setForm({ title: '', amount: '', category: 'Other', description: '', date: new Date().toISOString().slice(0, 10) });
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/api/expenses/${id}`); load(); }
    catch { alert('Failed to delete'); }
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '10px 13px', fontSize: 13, width: '100%', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>Expenses</h2>
          <p style={{ fontSize: 13, color: theme.textFaint, marginTop: 3 }}>Total: {fmt(total)}</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Add Expense</button>
      </div>

      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {['Title', 'Category', 'Amount', 'Date', 'Description', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e: any) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: theme.text }}>{e.title}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>{e.category}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ef4444' }}>{fmt(e.amount)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: theme.textFaint }}>{e.date ? new Date(e.date).toLocaleDateString() : new Date(e.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: theme.textMuted }}>{e.description || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => del(e.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '5px 11px', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && expenses.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: theme.textFaint }}>No expenses yet.</div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 28, width: '90%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>Add Expense</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ l: 'Title *', k: 'title' }, { l: 'Amount *', k: 'amount', type: 'number' }, { l: 'Date', k: 'date', type: 'date' }, { l: 'Description', k: 'description' }].map(({ l, k, type }: any) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                  <input type={type || 'text'} value={(form as any)[k]} onChange={e => setForm((v: any) => ({ ...v, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>Category</label>
                <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} style={inp}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Add Expense'}</button>
              <button onClick={() => setShowModal(false)} style={{ background: theme.hover, border: `1px solid ${theme.border}`, color: theme.textMuted, padding: '12px 20px', borderRadius: 10, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
