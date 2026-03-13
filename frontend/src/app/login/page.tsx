'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, token, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@kiranaking.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && token) router.replace('/dashboard'); }, [token, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a10', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'system-ui,sans-serif' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', borderRadius:14, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:900, color:'white', marginBottom:16 }}>S</div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'white', margin:0 }}>Shop OS</h1>
          <p style={{ color:'#475569', fontSize:14, marginTop:6 }}>Sign in to your dashboard</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background:'#15151d', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:28 }}>
          {error && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:18 }}>{error}</div>}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ background:'#1a1a24', border:'1px solid rgba(255,255,255,.1)', color:'#e2e8f0', borderRadius:9, padding:'11px 14px', fontSize:14, width:'100%', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ background:'#1a1a24', border:'1px solid rgba(255,255,255,.1)', color:'#e2e8f0', borderRadius:9, padding:'11px 14px', fontSize:14, width:'100%', outline:'none', boxSizing:'border-box' }} />
          </div>
          <button type="submit" disabled={busy}
            style={{ width:'100%', background:'linear-gradient(135deg,#7c3aed,#3b82f6)', border:'none', color:'white', padding:'13px', borderRadius:10, fontWeight:700, fontSize:15, cursor:busy?'not-allowed':'pointer', opacity:busy?0.7:1 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
          <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#334155' }}>
            Demo: admin@kiranaking.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
