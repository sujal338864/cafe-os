'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, loading, user, shop, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && !token) router.replace('/login'); }, [token, loading]);
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:theme.bg, color:theme.textMuted, fontFamily:'system-ui,sans-serif', flexDirection:'column', gap:12 }}>
      <div style={{ width:42, height:42, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'white', fontSize:20 }}>S</div>
      <span>Loading...</span>
    </div>
  );
  if (!token) return null;
  const NAV = [
    { href:'/dashboard',            label:'Dashboard',  icon:'H', color:'#3b82f6' },
    { href:'/dashboard/pos',        label:'New Sale',   icon:'N', color:'#10b981' },
    { href:'/dashboard/products',   label:'Products',   icon:'P', color:'#a78bfa' },
    { href:'/dashboard/categories', label:'Categories', icon:'C', color:'#f59e0b' },
    { href:'/dashboard/orders',     label:'Orders',     icon:'O', color:'#ec4899' },
    { href:'/dashboard/customers',  label:'Customers',  icon:'U', color:'#06b6d4' },
    { href:'/dashboard/suppliers',  label:'Suppliers',  icon:'V', color:'#8b5cf6' },
    { href:'/dashboard/expenses',   label:'Expenses',   icon:'E', color:'#ef4444' },
    { href:'/dashboard/analytics',  label:'Analytics',  icon:'A', color:'#f97316' },
    { href:'/dashboard/settings',   label:'Settings',   icon:'G', color:'#64748b' },
  ];
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:theme.bg, fontFamily:'system-ui,sans-serif', color:theme.text }}>
      <aside style={{ width:220, background:theme.sidebar, borderRight:`1px solid ${theme.border}`, display:'flex', flexDirection:'column', padding:'16px 10px', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ padding:'4px 10px 24px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'white', fontSize:16, flexShrink:0 }}>S</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:theme.text }}>Shop OS</div>
            <div style={{ fontSize:11, color:theme.textFaint }}>{shop?.name || 'Your Shop'}</div>
          </div>
        </div>
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map(({ href, label, icon, color }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <a key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, fontSize:13, fontWeight:500, color:active?theme.text:theme.textMuted, background:active?theme.accentBg:'transparent', textDecoration:'none' }}>
                <div style={{ width:24, height:24, borderRadius:6, background:active?color+'33':theme.hover, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:active?color:theme.textFaint, flexShrink:0 }}>{icon}</div>
                {label}
                {active && <div style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:color }} />}
              </a>
            );
          })}
        </nav>
        <div style={{ borderTop:`1px solid ${theme.border}`, paddingTop:12, marginTop:8 }}>
          <div style={{ padding:'8px 10px', marginBottom:8, display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'white', flexShrink:0 }}>{user?.name?.[0]?.toUpperCase()||'A'}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:theme.text }}>{user?.name}</div>
              <div style={{ fontSize:10, color:theme.textFaint }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width:'100%', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#ef4444', padding:'9px', borderRadius:9, cursor:'pointer', fontSize:13, fontWeight:600 }}>Sign Out</button>
        </div>
      </aside>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ height:56, background:theme.headerBg, borderBottom:`1px solid ${theme.border}`, display:'flex', alignItems:'center', padding:'0 24px', flexShrink:0 }}>
          <div style={{ flex:1 }}><div style={{ fontSize:13, color:theme.textMuted }}>{NAV.find(n => n.href === pathname || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.label || 'Dashboard'}</div></div>
          <span style={{ fontSize:12, color:theme.accent, background:theme.accentBg, border:`1px solid ${theme.accentBorder}`, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{shop?.plan || 'STARTER'}</span>
        </header>
        <main style={{ flex:1, overflow:'auto', padding:24 }}>{children}</main>
      </div>
    </div>
  );
}