'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { theme, isDark, toggle } = useTheme();
  const { user, shop } = useAuth();
  const [shopForm, setShopForm] = useState({ name: '', address: '', phone: '', email: '', currency: 'PKR', taxRate: '' });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');
  const [err,      setErr]      = useState('');
  const [tab,      setTab]      = useState<'shop' | 'account' | 'appearance'>('shop');

  useEffect(() => {
    if (shop) setShopForm(f => ({ ...f, name: shop.name || '', ...(shop as any) }));
  }, [shop]);

  const saveShop = async () => {
    setSaving(true); setMsg(''); setErr('');
    try {
      await api.put('/api/shop', shopForm);
      setMsg('Shop settings saved!');
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const savePass = async () => {
    if (!passForm.current || !passForm.newPass) { setErr('Fill all fields'); return; }
    if (passForm.newPass !== passForm.confirm) { setErr('Passwords do not match'); return; }
    setSaving(true); setMsg(''); setErr('');
    try {
      await api.put('/api/auth/password', { current: passForm.current, newPassword: passForm.newPass });
      setMsg('Password changed!');
      setPassForm({ current: '', newPass: '', confirm: '' });
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { background: theme.input, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 9, padding: '10px 13px', fontSize: 13, width: '100%', outline: 'none' };

  const TABS = [
    { k: 'shop', l: 'Shop Settings' },
    { k: 'account', l: 'Account' },
    { k: 'appearance', l: 'Appearance' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>Settings</h2>
        <p style={{ fontSize: 13, color: theme.textFaint, marginTop: 3 }}>Manage your shop preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: `1px solid ${theme.border}`, paddingBottom: 0 }}>
        {TABS.map(({ k, l }) => (
          <button key={k} onClick={() => { setTab(k); setMsg(''); setErr(''); }} style={{
            padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: tab === k ? theme.text : theme.textMuted,
            borderBottom: `2px solid ${tab === k ? '#7c3aed' : 'transparent'}`,
            marginBottom: -1,
          }}>{l}</button>
        ))}
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '11px 14px', color: '#10b981', fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '11px 14px', color: '#ef4444', fontSize: 13 }}>{err}</div>}

      {/* Shop Settings */}
      {tab === 'shop' && (
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Shop Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { l: 'Shop Name', k: 'name', full: true },
              { l: 'Phone', k: 'phone' },
              { l: 'Email', k: 'email', type: 'email' },
              { l: 'Address', k: 'address', full: true },
              { l: 'Currency', k: 'currency' },
              { l: 'Tax Rate (%)', k: 'taxRate', type: 'number' },
            ].map(({ l, k, type, full }: any) => (
              <div key={k} style={full ? { gridColumn: '1 / -1' } : {}}>
                <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                <input type={type || 'text'} value={(shopForm as any)[k] || ''} onChange={e => setShopForm(v => ({ ...v, [k]: e.target.value }))} style={inp} />
              </div>
            ))}
          </div>
          <button onClick={saveShop} disabled={saving} style={{ marginTop: 20, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '11px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Account */}
      {tab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Account Info</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, color: 'white' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: theme.textMuted }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 3, fontWeight: 600 }}>{user?.role}</div>
              </div>
            </div>
          </div>

          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Change Password</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
              {[{ l: 'Current Password', k: 'current' }, { l: 'New Password', k: 'newPass' }, { l: 'Confirm Password', k: 'confirm' }].map(({ l, k }) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: theme.textFaint, fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>{l}</label>
                  <input type="password" value={(passForm as any)[k]} onChange={e => setPassForm(v => ({ ...v, [k]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            <button onClick={savePass} disabled={saving} style={{ marginTop: 20, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '11px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {/* Appearance */}
      {tab === 'appearance' && (
        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Appearance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: theme.hover, borderRadius: 12, border: `1px solid ${theme.border}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 3 }}>Currently using {isDark ? 'dark' : 'light'} theme</div>
            </div>
            <button onClick={toggle} style={{
              width: 52, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative',
              background: isDark ? '#7c3aed' : theme.border, transition: 'background 0.25s',
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 4, transition: 'left 0.25s', left: isDark ? 28 : 4 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
