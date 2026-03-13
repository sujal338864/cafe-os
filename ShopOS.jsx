import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── MOCK DATA ──────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: "Sep", revenue: 84000, orders: 142, profit: 21000 },
  { month: "Oct", revenue: 96000, orders: 168, profit: 24000 },
  { month: "Nov", revenue: 112000, orders: 201, profit: 28000 },
  { month: "Dec", revenue: 148000, orders: 267, profit: 37000 },
  { month: "Jan", revenue: 128000, orders: 231, profit: 32000 },
  { month: "Feb", revenue: 162000, orders: 298, profit: 40500 },
];

const TOP_PRODUCTS = [
  { name: "Basmati Rice 5kg", revenue: 48000, units: 320, growth: 12 },
  { name: "Toor Dal 1kg", revenue: 36000, units: 900, growth: 8 },
  { name: "Sunflower Oil 1L", revenue: 32000, units: 640, growth: -3 },
  { name: "Wheat Flour 10kg", revenue: 28000, units: 280, growth: 15 },
  { name: "Sugar 1kg", revenue: 22000, units: 1100, growth: 5 },
];

const LOW_STOCK = [
  { name: "Basmati Rice 5kg", stock: 4, alert: 10, sku: "PRD-001" },
  { name: "Mustard Oil 500ml", stock: 2, alert: 15, sku: "PRD-047" },
  { name: "Masoor Dal 500g", stock: 7, alert: 20, sku: "PRD-012" },
  { name: "Coconut Oil 1L", stock: 3, alert: 10, sku: "PRD-089" },
];

const PRODUCTS = [
  { id: 1, name: "Basmati Rice 5kg", sku: "PRD-001", category: "Grains", cost: 180, price: 320, stock: 4, alert: 10 },
  { id: 2, name: "Toor Dal 1kg", sku: "PRD-002", category: "Pulses", cost: 85, price: 120, stock: 45, alert: 20 },
  { id: 3, name: "Sunflower Oil 1L", sku: "PRD-003", category: "Oils", cost: 140, price: 185, stock: 28, alert: 10 },
  { id: 4, name: "Wheat Flour 10kg", sku: "PRD-004", category: "Grains", cost: 280, price: 380, stock: 16, alert: 15 },
  { id: 5, name: "Sugar 1kg", sku: "PRD-005", category: "Essentials", cost: 38, price: 52, stock: 82, alert: 30 },
  { id: 6, name: "Mustard Oil 500ml", sku: "PRD-006", category: "Oils", cost: 75, price: 105, stock: 2, alert: 15 },
  { id: 7, name: "Masoor Dal 500g", sku: "PRD-007", category: "Pulses", cost: 45, price: 68, stock: 7, alert: 20 },
  { id: 8, name: "Green Tea 100g", sku: "PRD-008", category: "Beverages", cost: 85, price: 145, stock: 34, alert: 10 },
];

const CUSTOMERS = [
  { id: 1, name: "Rajan Patel", phone: "9876543210", email: "rajan@gmail.com", purchases: 48200, outstanding: 0 },
  { id: 2, name: "Sunita Sharma", phone: "9823456781", email: "sunita@yahoo.com", purchases: 32500, outstanding: 1200 },
  { id: 3, name: "Mohit Gupta", phone: "9901234567", email: "mohit@gmail.com", purchases: 28900, outstanding: 0 },
  { id: 4, name: "Priya Joshi", phone: "9845678901", email: "priya@gmail.com", purchases: 21600, outstanding: 3400 },
];

const RECENT_ORDERS = [
  { id: "INV-00298", customer: "Rajan Patel", amount: 1840, method: "UPI", status: "Paid", time: "2 min ago" },
  { id: "INV-00297", customer: "Walk-in", amount: 560, method: "Cash", status: "Paid", time: "18 min ago" },
  { id: "INV-00296", customer: "Sunita Sharma", amount: 2340, method: "Credit", status: "Unpaid", time: "1 hr ago" },
  { id: "INV-00295", customer: "Mohit Gupta", amount: 890, method: "Card", status: "Paid", time: "2 hr ago" },
  { id: "INV-00294", customer: "Priya Joshi", amount: 3200, method: "UPI", status: "Paid", time: "3 hr ago" },
];

const CATEGORY_DATA = [
  { name: "Grains", value: 42, color: "#f59e0b" },
  { name: "Oils", value: 24, color: "#3b82f6" },
  { name: "Pulses", value: 18, color: "#10b981" },
  { name: "Essentials", value: 16, color: "#8b5cf6" },
];

const AI_INSIGHTS = [
  { type: "warning", icon: "⚠️", msg: "4 products are critically low on stock. Restock before weekend rush." },
  { type: "success", icon: "📈", msg: "Sales increased 26% compared to last week. February is your best month." },
  { type: "info", icon: "💡", msg: "Toor Dal shows consistent demand. Consider bulk purchasing to improve margins." },
  { type: "warning", icon: "💳", msg: "2 customers have outstanding balance totaling ₹4,600. Send payment reminders." },
];

const AI_RESPONSES = {
  "profit": "Your net profit this month is ₹40,500 — a 26.5% margin on ₹1,62,000 revenue. That's 12.8% better than January.",
  "top": "Your top product is Basmati Rice 5kg with ₹48,000 revenue (320 units). Toor Dal follows at ₹36,000.",
  "stock": "4 products need immediate restocking: Mustard Oil (2 left), Basmati Rice (4 left), Coconut Oil (3 left), Masoor Dal (7 left).",
  "slow": "Slow-moving inventory: Green Tea 100g (only 8 units sold this month), Coconut Oil 1L (12 units).",
  "sales": "Today's sales: ₹8,240 across 14 orders. Best day this week was Thursday with ₹12,800.",
  "default": "I can help you analyze sales trends, check inventory levels, review profit margins, and identify growth opportunities. What would you like to know?",
};

// ─── ICONS (inline SVG) ─────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }: any) => {
  const icons: Record<string, string> = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    receipt: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    truck: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0H3m14 0h2",
    chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    ai: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    plus: "M12 4v16m8-8H4",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    trending: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    arrow_up: "M5 10l7-7m0 0l7 7m-7-7v18",
    arrow_down: "M19 14l-7 7m0 0l-7-7m7 7V3",
    shopping: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    x: "M6 18L18 6M6 6l12 12",
    send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    purchase: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    expense: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v1m-2.599-1c.517.598 1.488 1 2.599 1",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── UTILITIES ──────────────────────────────────────────────
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const fmtShort = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

// ─── MAIN APP ──────────────────────────────────────────────
export default function ShopOS() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewSale, setShowNewSale] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI business assistant. Ask me anything about your shop — sales, inventory, profits, trends." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [products, setProducts] = useState(PRODUCTS);
  const [productSearch, setProductSearch] = useState("");
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posSearch, setPosSearch] = useState("");

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(m => [...m, { role: "user", text: userMsg }]);
    setTimeout(() => {
      let reply = AI_RESPONSES.default;
      if (q.includes("profit")) reply = AI_RESPONSES.profit;
      else if (q.includes("top") || q.includes("best")) reply = AI_RESPONSES.top;
      else if (q.includes("stock") || q.includes("restock")) reply = AI_RESPONSES.stock;
      else if (q.includes("slow")) reply = AI_RESPONSES.slow;
      else if (q.includes("sales") || q.includes("today") || q.includes("revenue")) reply = AI_RESPONSES.sales;
      setChatMessages(m => [...m, { role: "ai", text: reply }]);
    }, 800);
  }, [chatInput]);

  const addToCart = (product: any) => {
    setPosCart(c => {
      const ex = c.find(i => i.id === product.id);
      if (ex) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
  };

  const cartTotal = posCart.reduce((s, i) => s + i.price * i.qty, 0);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "pos", label: "New Sale", icon: "shopping" },
    { id: "products", label: "Products", icon: "box" },
    { id: "orders", label: "Orders", icon: "receipt" },
    { id: "customers", label: "Customers", icon: "users" },
    { id: "suppliers", label: "Suppliers", icon: "truck" },
    { id: "purchases", label: "Purchases", icon: "purchase" },
    { id: "expenses", label: "Expenses", icon: "expense" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "ai", label: "AI Insights", icon: "ai" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif", background: "#0f0f12", color: "#e2e8f0", minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
        .nav-item { transition: all 0.15s ease; border-radius: 10px; cursor: pointer; }
        .nav-item:hover { background: rgba(139,92,246,0.12) !important; color: #a78bfa !important; }
        .nav-item.active { background: linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.15)) !important; color: #a78bfa !important; border: 1px solid rgba(139,92,246,0.3); }
        .card { background: #16161e; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; transition: border-color 0.2s; }
        .card:hover { border-color: rgba(255,255,255,0.12); }
        .stat-card { background: linear-gradient(135deg,#16161e,#1a1a26); }
        .btn-primary { background: linear-gradient(135deg,#7c3aed,#3b82f6); border: none; color: white; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; transition: opacity 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-green { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge-red { background: rgba(239,68,68,0.15); color: #ef4444; }
        .badge-yellow { background: rgba(245,158,11,0.15); color: #f59e0b; }
        .badge-blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
        .badge-purple { background: rgba(139,92,246,0.15); color: #a78bfa; }
        input, select { background: #1e1e2a; border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; padding: 10px 14px; border-radius: 10px; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s; font-family: inherit; }
        input:focus, select:focus { border-color: rgba(139,92,246,0.5); }
        input::placeholder { color: #475569; }
        table { width: 100%; border-collapse: collapse; }
        th { color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
        td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal { background: #16161e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
        .chat-bubble-ai { background: #1e1e2a; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px 12px 12px 4px; }
        .chat-bubble-user { background: linear-gradient(135deg,#7c3aed,#3b82f6); border-radius: 12px 12px 4px 12px; }
        .progress-bar { height: 6px; background: #1e1e2a; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
        .glow-purple { box-shadow: 0 0 30px rgba(139,92,246,0.15); }
      `}</style>

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside style={{ width: sidebarOpen ? 240 : 72, background: "#0c0c14", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "20px 12px", flexShrink: 0, transition: "width 0.25s ease", overflow: "hidden" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 24px", cursor: "pointer" }} onClick={() => setSidebarOpen(o => !o)}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>S</span>
          </div>
          {sidebarOpen && <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "white", whiteSpace: "nowrap" }}>Shop OS</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Kirana King Store</div>
          </div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", color: activeSection === item.id ? "#a78bfa" : "#64748b" }}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon name={item.icon} size={18} />
              {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Plan badge */}
        {sidebarOpen && (
          <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(59,130,246,0.1))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pro Plan</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Renews Mar 31</div>
          </div>
        )}
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ height: 64, background: "#0c0c14", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: "relative", maxWidth: 320 }}>
              <Icon name="search" size={16} className="" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input placeholder="Search products, customers..." style={{ paddingLeft: 38, background: "#16161e" }} />
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowNewSale(true)}>
            <Icon name="plus" size={16} /> New Sale
          </button>
          <div style={{ position: "relative" }}>
            <button className="btn-ghost" style={{ padding: "8px 12px", position: "relative" }} onClick={() => setNotifOpen(o => !o)}>
              <Icon name="bell" size={18} />
              <span style={{ position: "absolute", top: 6, right: 8, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #0c0c14" }} />
            </button>
            {notifOpen && (
              <div className="card" style={{ position: "absolute", right: 0, top: 48, width: 320, zIndex: 50, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 700, fontSize: 14 }}>Notifications</div>
                {AI_INSIGHTS.map((n, i) => (
                  <div key={i} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 10, cursor: "pointer" }}>
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{n.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 14, cursor: "pointer" }}>K</div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* ═══════════════════════════════════════════════
              DASHBOARD
          ═══════════════════════════════════════════════ */}
          {activeSection === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "white" }}>Good morning, Kiran 👋</h1>
                  <p style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>Sunday, March 8, 2026 — Here's your business overview</p>
                </div>
                <button className="btn-ghost"><Icon name="download" size={16} /> Export Report</button>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "Revenue Today", value: "₹8,240", sub: "+18% vs yesterday", icon: "trending", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                  { label: "Monthly Revenue", value: "₹1,62,000", sub: "+26% vs last month", icon: "chart", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                  { label: "Net Profit (Feb)", value: "₹40,500", sub: "25.0% margin", icon: "expense", color: "#a78bfa", bg: "rgba(139,92,246,0.1)" },
                  { label: "Low Stock Items", value: "4", sub: "Need restocking", icon: "box", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                ].map((s, i) => (
                  <div key={i} className="card stat-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: "white", marginTop: 8 }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: s.color, marginTop: 6, fontWeight: 500 }}>{s.sub}</div>
                      </div>
                      <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                        <Icon name={s.icon} size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                {/* Revenue chart */}
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Revenue & Profit</h3>
                      <p style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>Last 6 months</p>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}><span style={{ width: 10, height: 10, background: "#3b82f6", borderRadius: 2, display: "inline-block" }} />Revenue</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}><span style={{ width: 10, height: 10, background: "#10b981", borderRadius: 2, display: "inline-block" }} />Profit</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={MONTHLY_DATA}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={v => `₹${v / 1000}K`} />
                      <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e2e8f0" }} formatter={(v: any) => [fmt(v)]} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category pie */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 20 }}>Sales by Category</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {CATEGORY_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} formatter={(v: any) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {CATEGORY_DATA.map((c, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                          <span style={{ fontSize: 13, color: "#94a3b8" }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Recent orders */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Recent Orders</h3>
                    <button className="btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setActiveSection("orders")}>View all</button>
                  </div>
                  <table>
                    <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                      {RECENT_ORDERS.map((o, i) => (
                        <tr key={i}>
                          <td><span style={{ fontFamily: "DM Mono", fontSize: 13, color: "#a78bfa" }}>{o.id}</span></td>
                          <td><div style={{ fontSize: 14 }}>{o.customer}</div><div style={{ fontSize: 12, color: "#475569" }}>{o.time}</div></td>
                          <td style={{ fontWeight: 600 }}>{fmt(o.amount)}</td>
                          <td>
                            <span className={`badge ${o.status === "Paid" ? "badge-green" : "badge-yellow"}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Low stock + AI */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="card" style={{ padding: 0, overflow: "hidden", flex: 1 }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>⚠️ Low Stock</h3>
                      <button className="btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setActiveSection("products")}>Manage</button>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                      {LOW_STOCK.map((p, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "#475569" }}>{p.sku}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: p.stock <= 3 ? "#ef4444" : "#f59e0b" }}>{p.stock} left</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>min {p.alert}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights strip */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🤖</span> AI Business Insights
                  </h3>
                  <button className="btn-ghost" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => setChatOpen(true)}>Ask AI Assistant</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {AI_INSIGHTS.map((ins, i) => (
                    <div key={i} style={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, lineHeight: 1 }}>{ins.icon}</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{ins.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              POS / NEW SALE
          ═══════════════════════════════════════════════ */}
          {activeSection === "pos" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, height: "calc(100vh - 112px)" }}>
              {/* Product search */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>🛒 Point of Sale</h2>
                  <input style={{ maxWidth: 280 }} placeholder="Search products by name or SKU..." value={posSearch} onChange={e => setPosSearch(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, overflow: "auto", paddingBottom: 16 }}>
                  {PRODUCTS.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase())).map(p => (
                    <div key={p.id} className="card" style={{ padding: 16, cursor: "pointer", transition: "all 0.2s" }} onClick={() => addToCart(p)}>
                      <div style={{ width: "100%", aspectRatio: "1", background: "linear-gradient(135deg,#1e1e2a,#16161e)", borderRadius: 10, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                        🛍️
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16 }}>{fmt(p.price)}</span>
                        <span className={`badge ${p.stock <= p.alert ? "badge-red" : "badge-green"}`}>{p.stock} left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Current Sale</h3>
                  <input placeholder="Customer name (optional)" style={{ marginTop: 12 }} />
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
                  {posCart.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                      <div>Click products to add them</div>
                    </div>
                  ) : posCart.map((item, i) => (
                    <div key={i} style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: "#475569" }}>{fmt(item.price)} each</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1e1e2a", borderRadius: 8, padding: "4px 10px" }}>
                          <button onClick={() => setPosCart(c => c.map(ci => ci.id === item.id ? { ...ci, qty: Math.max(0, ci.qty - 1) } : ci).filter(ci => ci.qty > 0))} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, width: 20 }}>-</button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                          <button onClick={() => addToCart(item)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, width: 20 }}>+</button>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 64, textAlign: "right" }}>{fmt(item.price * item.qty)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {posCart.length > 0 && (
                  <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#94a3b8" }}>
                      <span>Subtotal</span><span>{fmt(cartTotal)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#94a3b8" }}>
                      <span>Tax (18%)</span><span>{fmt(Math.round(cartTotal * 0.18))}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 18, fontWeight: 800, color: "white", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span>Total</span><span>{fmt(Math.round(cartTotal * 1.18))}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {["Cash", "UPI", "Card"].map(m => (
                        <button key={m} className="btn-ghost" style={{ padding: "10px 0", textAlign: "center", fontSize: 13 }}>{m}</button>
                      ))}
                    </div>
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }} onClick={() => { setPosCart([]); alert("✅ Invoice INV-00299 generated! ₹" + Math.round(cartTotal * 1.18).toLocaleString()); }}>
                      💳 Charge {fmt(Math.round(cartTotal * 1.18))}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              PRODUCTS
          ═══════════════════════════════════════════════ */}
          {activeSection === "products" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Products & Inventory</h2>
                  <p style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>{products.length} products · Total value: {fmt(products.reduce((s, p) => s + p.price * p.stock, 0))}</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-ghost"><Icon name="download" size={16} /> Export CSV</button>
                  <button className="btn-primary" onClick={() => setShowAddProduct(true)}><Icon name="plus" size={16} /> Add Product</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Products", value: products.length, color: "#3b82f6" },
                  { label: "Low Stock", value: products.filter(p => p.stock <= p.alert).length, color: "#f59e0b" },
                  { label: "Out of Stock", value: products.filter(p => p.stock === 0).length, color: "#ef4444" },
                  { label: "Inventory Value", value: fmt(products.reduce((s, p) => s + p.cost * p.stock, 0)), color: "#10b981" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 13, color: "#475569" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12 }}>
                  <input style={{ maxWidth: 280 }} placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                  <select style={{ width: 160 }}><option>All Categories</option><option>Grains</option><option>Pulses</option><option>Oils</option></select>
                </div>
                <table>
                  <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Cost</th><th>Price</th><th>Margin</th><th>Stock</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const margin = (((p.price - p.cost) / p.price) * 100).toFixed(0);
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 500 }}>{p.name}</td>
                          <td><span style={{ fontFamily: "DM Mono", fontSize: 12, color: "#475569" }}>{p.sku}</span></td>
                          <td><span className="badge badge-blue">{p.category}</span></td>
                          <td style={{ color: "#94a3b8" }}>{fmt(p.cost)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                          <td><span style={{ color: "#10b981", fontWeight: 600 }}>{margin}%</span></td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <span style={{ fontWeight: 600, color: p.stock <= p.alert ? "#ef4444" : "white" }}>{p.stock}</span>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div className="progress-fill" style={{ width: `${Math.min(100, (p.stock / (p.alert * 3)) * 100)}%`, background: p.stock <= p.alert ? "#ef4444" : "#10b981" }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${p.stock === 0 ? "badge-red" : p.stock <= p.alert ? "badge-yellow" : "badge-green"}`}>
                              {p.stock === 0 ? "Out of Stock" : p.stock <= p.alert ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ORDERS
          ═══════════════════════════════════════════════ */}
          {activeSection === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Orders & Invoices</h2>
                <div style={{ display: "flex", gap: 12 }}>
                  <input type="date" style={{ width: 160 }} defaultValue="2026-02-01" />
                  <input type="date" style={{ width: 160 }} defaultValue="2026-03-08" />
                  <button className="btn-ghost"><Icon name="download" size={16} /> Export</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Total Orders", value: "298", color: "#3b82f6" },
                  { label: "Revenue", value: "₹1,62,000", color: "#10b981" },
                  { label: "Avg Order Value", value: "₹543", color: "#a78bfa" },
                  { label: "Unpaid", value: "₹4,600", color: "#f59e0b" },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 13, color: "#475569" }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table>
                  <thead><tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {[...RECENT_ORDERS, ...RECENT_ORDERS].map((o, i) => (
                      <tr key={i} style={{ cursor: "pointer" }}>
                        <td><span style={{ fontFamily: "DM Mono", fontSize: 13, color: "#a78bfa" }}>INV-{String(298 - i).padStart(5, "0")}</span></td>
                        <td>{o.customer}</td>
                        <td style={{ color: "#475569" }}>{Math.floor(Math.random() * 5) + 1} items</td>
                        <td style={{ fontWeight: 600 }}>{fmt(o.amount + i * 123)}</td>
                        <td><span className="badge badge-blue">{o.method}</span></td>
                        <td><span className={`badge ${o.status === "Paid" ? "badge-green" : "badge-yellow"}`}>{o.status}</span></td>
                        <td style={{ color: "#475569", fontSize: 13 }}>{o.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              CUSTOMERS
          ═══════════════════════════════════════════════ */}
          {activeSection === "customers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Customer Management</h2>
                <button className="btn-primary"><Icon name="plus" size={16} /> Add Customer</button>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table>
                  <thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Total Purchases</th><th>Outstanding</th><th>Status</th></tr></thead>
                  <tbody>
                    {CUSTOMERS.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,hsl(${i * 60},60%,40%),hsl(${i * 60 + 30},60%,30%))`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                              {c.name[0]}
                            </div>
                            <span style={{ fontWeight: 500 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "#94a3b8" }}>{c.phone}</td>
                        <td style={{ color: "#94a3b8" }}>{c.email}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(c.purchases)}</td>
                        <td style={{ color: c.outstanding > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                          {c.outstanding > 0 ? fmt(c.outstanding) : "Cleared"}
                        </td>
                        <td><span className={`badge ${c.outstanding > 2000 ? "badge-yellow" : "badge-green"}`}>{c.outstanding > 2000 ? "Due" : "Good"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              ANALYTICS
          ═══════════════════════════════════════════════ */}
          {activeSection === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Analytics & Reports</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 20 }}>Monthly Orders</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={MONTHLY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                      <Bar dataKey="orders" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 20 }}>Top Products by Revenue</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {TOP_PRODUCTS.map((p, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{fmtShort(p.revenue)}</span>
                            <span style={{ fontSize: 12, color: p.growth >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>{p.growth >= 0 ? "+" : ""}{p.growth}%</span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(p.revenue / TOP_PRODUCTS[0].revenue) * 100}%`, background: `hsl(${i * 40 + 220},70%,60%)` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Revenue Breakdown</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["7D", "1M", "3M", "6M", "1Y"].map(p => (
                      <button key={p} className="btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}>{p}</button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={MONTHLY_DATA}>
                    <defs>
                      <linearGradient id="bigGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} />
                    <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={v => `₹${v / 1000}K`} />
                    <Tooltip contentStyle={{ background: "#1e1e2a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e2e8f0" }} formatter={(v: any) => [fmt(v)]} />
                    <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#bigGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              AI INSIGHTS
          ═══════════════════════════════════════════════ */}
          {activeSection === "ai" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>🤖 AI Business Intelligence</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {AI_INSIGHTS.map((ins, i) => (
                  <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{ins.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 6 }}>
                        {["Inventory Alert", "Sales Trend", "Margin Opportunity", "Payment Reminder"][i]}
                      </div>
                      <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{ins.msg}</div>
                      <button className="btn-ghost" style={{ marginTop: 12, fontSize: 13, padding: "6px 14px" }}>Take Action →</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card glow-purple" style={{ padding: 24, background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.05))" }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  💬 AI Chat Assistant
                </h3>
                <div style={{ background: "#0f0f12", borderRadius: 16, padding: 16, minHeight: 300, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ maxWidth: "75%", padding: "12px 16px", fontSize: 14, lineHeight: 1.6 }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    placeholder="Ask about profits, inventory, sales trends..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                  />
                  <button className="btn-primary" onClick={sendChat} style={{ flexShrink: 0 }}>
                    <Icon name="send" size={16} /> Send
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {["How much profit this month?", "Which products sell best?", "Show low stock items", "Sales trend this week"].map(q => (
                    <button key={q} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => { setChatInput(q); }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              SETTINGS
          ═══════════════════════════════════════════════ */}
          {activeSection === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white" }}>Shop Settings</h2>
              {[
                { title: "Shop Profile", fields: [
                  { label: "Shop Name", val: "Kirana King Store", type: "text" },
                  { label: "Owner Name", val: "Kiran Mehta", type: "text" },
                  { label: "Phone", val: "+91 98765 43210", type: "text" },
                  { label: "GST Number", val: "22AAAAA0000A1Z5", type: "text" },
                  { label: "Address", val: "123, MG Road, Vadodara, Gujarat - 390001", type: "text" },
                ]},
                { title: "Business Settings", fields: [
                  { label: "Currency", val: "INR (₹)", type: "text" },
                  { label: "Timezone", val: "Asia/Kolkata (IST)", type: "text" },
                  { label: "Tax Rate (%)", val: "18", type: "number" },
                  { label: "Invoice Prefix", val: "INV-", type: "text" },
                ]},
              ].map((section, si) => (
                <div key={si} className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 20 }}>{section.title}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {section.fields.map((f, fi) => (
                      <div key={fi}>
                        <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                        <input type={f.type} defaultValue={f.val} />
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ marginTop: 20 }}>Save Changes</button>
                </div>
              ))}
              <div className="card" style={{ padding: 24, background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.05))", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Pro Plan — Active</h3>
                    <p style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>₹999/month · Renews March 31, 2026</p>
                  </div>
                  <button className="btn-primary">Upgrade to Enterprise</button>
                </div>
              </div>
            </div>
          )}

          {/* Suppliers / Purchases / Expenses — placeholder sections */}
          {["suppliers", "purchases", "expenses"].includes(activeSection) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", textTransform: "capitalize" }}>{activeSection}</h2>
                <button className="btn-primary"><Icon name="plus" size={16} /> Add {activeSection.slice(0, -1)}</button>
              </div>
              <div className="card" style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{activeSection === "suppliers" ? "🏭" : activeSection === "purchases" ? "📦" : "💸"}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>
                  {activeSection === "suppliers" ? "Supplier Management" : activeSection === "purchases" ? "Purchase Orders" : "Expense Tracking"}
                </h3>
                <p style={{ color: "#475569", maxWidth: 400, margin: "0 auto" }}>
                  {activeSection === "suppliers"
                    ? "Manage your suppliers, track purchase history and outstanding payments."
                    : activeSection === "purchases"
                    ? "Record inventory purchases from suppliers with auto stock updates."
                    : "Track business expenses — rent, electricity, salaries and more."}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── FLOATING AI CHAT BUTTON ──────────────────────── */}
      <button
        onClick={() => setChatOpen(o => !o)}
        style={{ position: "fixed", bottom: 28, right: 28, width: 56, height: 56, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(124,58,237,0.4)", zIndex: 90, fontSize: 24 }}
      >
        🤖
      </button>

      {/* ── QUICK AI CHAT POPUP ──────────────────────────── */}
      {chatOpen && (
        <div style={{ position: "fixed", bottom: 96, right: 28, width: 380, background: "#16161e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, zIndex: 91, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ padding: "16px 20px", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "white" }}>🤖 AI Assistant</span>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", opacity: 0.8 }}><Icon name="x" size={16} /></button>
          </div>
          <div style={{ padding: 16, maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.slice(-5).map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ maxWidth: "80%", padding: "10px 14px", fontSize: 13, lineHeight: 1.6 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
            <input
              placeholder="Ask anything..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              style={{ flex: 1, fontSize: 13, padding: "9px 12px" }}
            />
            <button className="btn-primary" onClick={sendChat} style={{ padding: "9px 14px" }}>
              <Icon name="send" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── ADD PRODUCT MODAL ────────────────────────────── */}
      {showAddProduct && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowAddProduct(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: "white" }}>Add New Product</h3>
              <button onClick={() => setShowAddProduct(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Product Name*", placeholder: "e.g. Basmati Rice 5kg" },
                { label: "SKU", placeholder: "e.g. PRD-101" },
                { label: "Category", placeholder: "e.g. Grains" },
                { label: "Barcode", placeholder: "Scan or enter" },
                { label: "Cost Price (₹)*", placeholder: "0.00", type: "number" },
                { label: "Selling Price (₹)*", placeholder: "0.00", type: "number" },
                { label: "Stock Quantity*", placeholder: "0", type: "number" },
                { label: "Low Stock Alert", placeholder: "10", type: "number" },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                  <input type={f.type || "text"} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setShowAddProduct(false)}>
                Add Product
              </button>
              <button className="btn-ghost" onClick={() => setShowAddProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
