'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token, data.user, data.shop);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };
  return (
    <div style={{minHeight:'100vh',background:'#0a0a10',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#15151d',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:40,width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:48,height:48,background:'linear-gradient(135deg,#7c3aed,#3b82f6)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'white',fontSize:22,margin:'0 auto 14px'}}>S</div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#e2e8f0'}}>Shop OS</h1>
          <p style={{fontSize:13,color:'#475569',marginTop:4}}>Sign in to your account</p>
        </div>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:9,padding:'10px 14px',fontSize:13,color:'#ef4444',marginBottom:16}}>{error}</div>}
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:12,color:'#475569',fontWeight:600,marginBottom:6}}>Email</label>
          <input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='admin@kiranaking.com' style={{width:'100%',background:'#1c1c26',border:'1px solid rgba(255,255,255,0.1)',color:'#e2e8f0',padding:'10px 13px',borderRadius:9,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:'block',fontSize:12,color:'#475569',fontWeight:600,marginBottom:6}}>Password</label>
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder='••••••••' style={{width:'100%',background:'#1c1c26',border:'1px solid rgba(255,255,255,0.1)',color:'#e2e8f0',padding:'10px 13px',borderRadius:9,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#3b82f6)',border:'none',color:'white',padding:'12px',borderRadius:9,fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{textAlign:'center',fontSize:12,color:'#334155',marginTop:20}}>Demo: admin@kiranaking.com / admin123</p>
      </div>
    </div>
  );
}
