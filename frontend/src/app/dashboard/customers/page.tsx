'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const fmt = (n: any) => 'Rs.' + Number(n||0).toLocaleString('en-IN');

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ name:'', phone:'', email:'', address:'' });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await api.get('/api/customers'); setCustomers(data.customers); }
    catch(e){ console.error(e); } finally { setLoading(false); }
  };

  const save = async () => {
    if (!form.name) { setError('Name required'); return; }
    setSaving(true); setError('');
    try { await api.post('/api/customers', form); setShowModal(false); setForm({ name:'', phone:'', email:'', address:'' }); load(); }
    catch(e: any) { setError(e.response?.data?.error||'Failed'); }
    finally { setSaving(false); }
  };

  const inp = { background:'#1c1c26', border:'1px solid rgba(255,255,255,.1)', color:'#e2e8f0', borderRadius:9, padding:'10px 13px', fontSize:13, width:'100%', outline:'none', boxSizing:'border-box' as const };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div><h2 style={{ fontSize:20, fontWeight:800, color:'white' }}>Customers</h2><p style={{ fontSize:13, color:'#334155', marginTop:3 }}>{customers.length} registered</p></div>
        <button onClick={()=>{setShowModal(true);setError('');}} style={{ background:'linear-gradient(135deg,#7c3aed,#3b82f6)', border:'none', color:'white', padding:'10px 20px', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>+ Add Customer</button>
      </div>
      <div style={{ background:'#15151d', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'#334155' }}>Loading...</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,.05)' }}>
              {['Customer','Phone','Email','Total Purchases','Outstanding'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, color:'#334155', fontWeight:700, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {customers.map((c:any,i:number) => (
                <tr key={c.id} style={{ borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'white', flexShrink:0 }}>{c.name[0].toUpperCase()}</div>
                      <span style={{ fontWeight:600, fontSize:13 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#475569' }}>{c.phone||'--'}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#475569' }}>{c.email||'--'}</td>
                  <td style={{ padding:'12px 14px', fontWeight:700 }}>{fmt(c.totalPurchases)}</td>
                  <td style={{ padding:'12px 14px', fontWeight:700, color:Number(c.outstandingBalance)>0?'#f59e0b':'#10b981' }}>{Number(c.outstandingBalance)>0?fmt(c.outstandingBalance):'Cleared'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && customers.length===0 && <div style={{ padding:40, textAlign:'center', color:'#334155' }}>No customers yet.</div>}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:'#15151d', border:'1px solid rgba(255,255,255,.1)', borderRadius:18, padding:28, width:'90%', maxWidth:440 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:16, color:'white' }}>Add Customer</div>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:22 }}>x</button>
            </div>
            {error && <div style={{ background:'rgba(239,68,68,.1)', borderRadius:8, padding:'10px 14px', color:'#ef4444', fontSize:13, marginBottom:14 }}>{error}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[{l:'Name *',k:'name'},{l:'Phone',k:'phone'},{l:'Email',k:'email'},{l:'Address',k:'address'}].map(({l,k})=>(
                <div key={k}>
                  <label style={{ display:'block', fontSize:11, color:'#334155', fontWeight:700, textTransform:'uppercase', marginBottom:5 }}>{l}</label>
                  <input value={(form as any)[k]} onChange={e=>setForm((v:any)=>({...v,[k]:e.target.value}))} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button onClick={save} disabled={saving} style={{ flex:1, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', border:'none', color:'white', padding:'12px', borderRadius:10, fontWeight:700, cursor:'pointer' }}>{saving?'Saving...':'Add Customer'}</button>
              <button onClick={()=>setShowModal(false)} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', color:'#94a3b8', padding:'12px 20px', borderRadius:10, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}