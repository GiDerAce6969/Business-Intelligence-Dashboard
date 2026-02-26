// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Activity, DollarSign, PieChart as PieChartIcon, MapPin, Percent, Receipt, TrendingUp } from "lucide-react";
import { DepartmentMetrics, TimeSeriesMetrics } from "@/types/metrics";

const CHART_COLORS = ['#22d3ee', '#d946ef', '#34d399', '#fbbf24'];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Dashboard() {
  const [data, setData] = useState<DepartmentMetrics[]>([]);
  const [timeData, setTimeData] = useState<TimeSeriesMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  useEffect(() => {
    // Fetch both endpoints in parallel for maximum performance
    const fetchData = async () => {
      try {
        const [deptRes, timeRes] = await Promise.all([
          axios.get<DepartmentMetrics[]>("http://127.0.0.1:8000/api/v1/metrics/departments"),
          axios.get<TimeSeriesMetrics[]>("http://127.0.0.1:8000/api/v1/metrics/timeseries")
        ]);
        setData(deptRes.data);
        setTimeData(timeRes.data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-cyan-400 font-mono">
        <span className="animate-pulse">INITIALIZING SECURE CONNECTION...</span>
      </div>
    );
  }

  // --- 1. PREPARE DEPARTMENT DATA (Fixes PieChart NaN bug) ---
  const filteredData = selectedRegion === "All" ? data : data.filter(d => d.region === selectedRegion);
  
  const parsedDeptData = filteredData.map(item => ({
    ...item,
    total_revenue: Number(item.total_revenue) || 0,
    total_margin: Number(item.total_margin) || 0,
    total_transactions: Number(item.total_transactions) || 0,
  }));

  const totalRevenue = parsedDeptData.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalMargin = parsedDeptData.reduce((sum, item) => sum + item.total_margin, 0);
  const totalTransactions = parsedDeptData.reduce((sum, item) => sum + item.total_transactions, 0);
  
  const marginPercentage = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : "0.0";
  const avgTransactionValue = totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : "0.00";

  // --- 2. PREPARE TIME SERIES DATA ---
  // Format the date (e.g., "Jan 2024") and sanitize strings to numbers
  const parsedTimeData = timeData.map(item => ({
    displayDate: `${MONTHS[item.month - 1]} ${item.year}`,
    revenue: Number(item.revenue) || 0,
    margin: Number(item.margin) || 0,
  }));

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200 selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Filter */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-8 h-8 text-cyan-400" />
              BI_CORE // Analytics
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-mono uppercase tracking-wider">Real-time telemetry and financial margins</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-lg border border-slate-800 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
            <MapPin className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-slate-200 text-sm font-medium focus:outline-none pr-4 cursor-pointer"
            >
              <option value="All" className="bg-slate-900">Global View</option>
              <option value="Malaysia" className="bg-slate-900">Malaysia</option>
              <option value="New Zealand" className="bg-slate-900">New Zealand</option>
            </select>
          </div>
        </header>

        {/* Enhanced KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card title="TOTAL REVENUE" value={`$${(totalRevenue / 1000).toFixed(1)}k`} icon={<DollarSign className="w-5 h-5 text-cyan-400" />} glowColor="rgba(34,211,238,0.15)" />
          <Card title="TOTAL MARGIN" value={`$${(totalMargin / 1000).toFixed(1)}k`} icon={<PieChartIcon className="w-5 h-5 text-fuchsia-500" />} glowColor="rgba(217,70,239,0.15)" />
          <Card title="MARGIN %" value={`${marginPercentage}%`} icon={<Percent className="w-5 h-5 text-emerald-400" />} glowColor="rgba(52,211,153,0.15)" />
          <Card title="AVG TRANSACTION" value={`$${avgTransactionValue}`} icon={<Receipt className="w-5 h-5 text-amber-400" />} glowColor="rgba(251,191,36,0.15)" />
        </div>

        {/* --- NEW SECTION: HISTORICAL TRENDS (LINE CHART) --- */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <h2 className="text-sm font-mono font-semibold text-slate-300 mb-6 uppercase tracking-widest border-l-2 border-emerald-400 pl-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Global Historical Revenue Trend
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={parsedTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip cursor={{ stroke: '#334155', strokeWidth: 1 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', color: '#cbd5e1' }}/>
                <Line type="monotone" dataKey="revenue" name="Historical Revenue" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#34d399', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#34d399', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visualizations Grid (Bar & Pie) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
            <h2 className="text-sm font-mono font-semibold text-slate-300 mb-6 uppercase tracking-widest border-l-2 border-cyan-400 pl-3">
              Revenue vs Margin Assessment
            </h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parsedDeptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="department_name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', color: '#cbd5e1' }}/>
                  <Bar dataKey="total_revenue" name="Total Revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="total_margin" name="Total Margin" fill="#d946ef" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
            <h2 className="text-sm font-mono font-semibold text-slate-300 mb-6 uppercase tracking-widest border-l-2 border-fuchsia-500 pl-3">
              Revenue Share
            </h2>
            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parsedDeptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total_revenue"
                    nameKey="department_name"
                    stroke="none"
                  >
                    {parsedDeptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} formatter={(value: number) => `$${(value/1000).toFixed(1)}k`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Data Table Section */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-md overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest border-l-2 border-amber-400 pl-3">
              Raw Telemetry Data
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950/50 text-xs uppercase font-mono text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Region</th>
                  <th className="px-6 py-4 font-medium text-right">Transactions</th>
                  <th className="px-6 py-4 font-medium text-right">Revenue</th>
                  <th className="px-6 py-4 font-medium text-right">Margin</th>
                  <th className="px-6 py-4 font-medium text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {parsedDeptData.map((row, idx) => {
                  const rRev = row.total_revenue;
                  const rMar = row.total_margin;
                  const mPct = rRev > 0 ? ((rMar / rRev) * 100).toFixed(1) : "0.0";
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-300">{row.department_name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-xs px-2 py-1 rounded-md border border-slate-700">{row.region}</span>
                      </td>
                      <td className="px-6 py-4 text-right">{row.total_transactions.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-cyan-400">${rRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-fuchsia-400">${rMar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-emerald-400">{mPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable KPI Card
function Card({ title, value, icon, glowColor }: { title: string, value: string, icon: React.ReactNode, glowColor: string }) {
  return (
    <div 
      className="bg-slate-900 p-5 rounded-xl border border-slate-800 transition-all duration-300 hover:border-slate-700 flex items-center space-x-4 relative overflow-hidden group"
      style={{ '--hover-glow': glowColor } as React.CSSProperties}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
           style={{ background: `radial-gradient(circle at center, var(--hover-glow) 0%, transparent 70%)` }} />
      
      <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 relative z-10">
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-xs font-mono font-medium text-slate-400 mb-1">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-white tracking-wide">{value}</p>
      </div>
    </div>
  );
}