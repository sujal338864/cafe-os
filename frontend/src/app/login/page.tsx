'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e8f0', borderRadius: 10, padding: '12px 14px',
    fontSize: 14, width: '100%', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '90%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 24, marginBottom: 14, boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}>S</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>Shop OS</div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Sign in to your account</div>
        </div>

        {/* Card */}
        <div style={{ background: '#15151d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 28 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '11px 14px', color: '#f87171', fontSize: 13, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com" style={inp}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••" style={inp}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', marginTop: 22, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', color: 'white', padding: '13px', borderRadius: 11, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 20 }}>
          Shop OS · Modern Shop Management
        </p>
      </div>
    </div>
  );
}
