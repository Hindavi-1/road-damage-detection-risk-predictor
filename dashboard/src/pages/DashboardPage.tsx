/**
 * DashboardPage — analytics overview with stats, charts, and critical cases.
 * Container component: fetches all data and passes it to presentational children.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  MapPin,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import DamagePieChart from "../components/charts/PieChart";
import FrequencyBarChart from "../components/charts/BarChart";
import PriorityBadge from "../components/prediction/PriorityBadge";
import Loader from "../components/common/Loader";

import {
  fetchDashboardStats,
  fetchDamageDistribution,
  fetchFrequencyData,
  fetchPriorityDistribution,
  fetchCriticalCases,
} from "../lib/api";

import type {
  DashboardStats,
  DamageDistribution,
  FrequencyDataPoint,
  PriorityDistribution,
  CriticalCase,
} from "../types";

// ── Stat card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ label, value, sub, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
          <p className={`text-4xl font-extrabold mt-3 tracking-tight ${gradient}`}>{value}</p>
          {sub && <p className="text-[11px] font-medium text-slate-400 mt-2">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-[var(--bg-surface)] shadow-inner border border-white/[0.05] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// ── Priority bar chart (custom) ────────────────────────────────────────────

function PriorityBarChart({ data }: { data: PriorityDistribution[] }) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-xl px-4 py-3 border border-white/10 text-sm shadow-xl">
        <p className="text-slate-400 font-medium">{label}</p>
        <p className="text-white font-bold mt-0.5">{payload[0].value} cases</p>
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/[0.07] h-full">
      <p className="text-sm font-semibold text-slate-300 mb-1">Priority Distribution</p>
      <p className="text-xs text-slate-600 mb-5">Case counts by assigned priority</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="priority" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Critical cases table ───────────────────────────────────────────────────

function CriticalCasesTable({ cases }: { cases: CriticalCase[] }) {
  return (
    <div className="glass rounded-2xl border border-white/[0.08] overflow-hidden shadow-lg">
      <div className="px-6 py-5 border-b border-white/[0.04] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <p className="text-sm font-bold text-slate-200 tracking-wide">Critical Attention Required</p>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">Highest risk locations prioritized by the AI assessment model</p>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {cases.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors"
          >
            {/* ID */}
            <span className="text-xs font-mono text-slate-600 flex-shrink-0 w-16">{c.id}</span>

            {/* Location */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <MapPin size={12} className="text-slate-600 flex-shrink-0" />
              <span className="text-sm text-slate-300 truncate">{c.location}</span>
            </div>

            {/* Risk score */}
            <span className="text-sm font-bold text-red-400 flex-shrink-0 w-12 text-right">
              {(c.risk_score * 100).toFixed(0)}%
            </span>

            {/* Priority badge */}
            <div className="flex-shrink-0">
              <PriorityBadge priority={c.priority} size="sm" pulse={c.priority === "Very High"} />
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-slate-700 flex-shrink-0">
              <Clock size={10} />
              {new Date(c.timestamp).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats,         setStats]         = useState<DashboardStats | null>(null);
  const [distribution,  setDistribution]  = useState<DamageDistribution[]>([]);
  const [frequency,     setFrequency]     = useState<FrequencyDataPoint[]>([]);
  const [priorities,    setPriorities]    = useState<PriorityDistribution[]>([]);
  const [criticalCases, setCriticalCases] = useState<CriticalCase[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchDamageDistribution(),
      fetchFrequencyData(),
      fetchPriorityDistribution(),
      fetchCriticalCases(),
    ]).then(([s, d, f, p, c]) => {
      setStats(s);
      setDistribution(d);
      setFrequency(f);
      setPriorities(p);
      setCriticalCases(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader label="Loading dashboard…" size="lg" />
      </div>
    );
  }

  const statCards: StatCardProps[] = [
    {
      label: "Total Analysed",
      value: stats!.total_analyzed.toLocaleString(),
      sub: "Road images processed",
      icon: <ImageIcon size={18} className="text-blue-400" />,
      gradient: "gradient-text",
      delay: 0,
    },
    {
      label: "High Priority",
      value: stats!.high_priority_count,
      sub: "Require urgent attention",
      icon: <AlertTriangle size={18} className="text-red-400" />,
      gradient: "text-red-400",
      delay: 0.08,
    },
    {
      label: "Avg Risk Score",
      value: stats!.average_risk_score.toFixed(2),
      sub: "Across all analyses",
      icon: <TrendingUp size={18} className="text-orange-400" />,
      gradient: "text-orange-400",
      delay: 0.16,
    },
    {
      label: "Common Damage",
      value: stats!.most_common_damage.charAt(0).toUpperCase() + stats!.most_common_damage.slice(1),
      sub: "Most frequent type",
      icon: <Activity size={18} className="text-cyan-400" />,
      gradient: "text-cyan-400",
      delay: 0.24,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <DamagePieChart data={distribution} />
        </div>
        <div className="lg:col-span-2">
          <FrequencyBarChart data={frequency} />
        </div>
      </div>

      {/* Priority distribution */}
      <PriorityBarChart data={priorities} />

      {/* Critical cases */}
      <CriticalCasesTable cases={criticalCases} />
    </div>
  );
}
