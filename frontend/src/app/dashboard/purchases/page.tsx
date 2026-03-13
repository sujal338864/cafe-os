'use client';
import { useTheme } from '@/context/ThemeContext';
export default function PurchasesPage() {
  const { theme } = useTheme();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:800, color:theme.text }}>Purchases</h2>
        <p style={{ fontSize:13, color:theme.textFaint, marginTop:3 }}>Purchase orders coming soon.</p>
      </div>
      <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:14, padding:60, textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🛒</div>
        <div style={{ color:theme.text, fontWeight:700, fontSize:16 }}>Purchase Orders</div>
        <p style={{ color:theme.textFaint, fontSize:13, marginTop:8 }}>This feature is coming soon.</p>
      </div>
    </div>
  );
}