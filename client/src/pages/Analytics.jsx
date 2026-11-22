import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#0b3d2e', '#1f7a8c', '#7cffb2', '#e85d4c', '#1a2b42', '#5b8def'];

const PRESETS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

function toInputDate(d) {
  return d.toISOString().slice(0, 10);
}

function rangeForPreset(preset) {
  if (preset === 'all') return { from: '', to: '' };
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toInputDate(from), to: toInputDate(to) };
}

export default function Analytics() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [preset, setPreset] = useState('30d');
  const initialRange = useMemo(() => rangeForPreset('30d'), []);
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await api.get(`/urls/${id}/analytics`, {
          params: {
            from: from || undefined,
            to: to || undefined,
          },
        });
        if (!cancelled) {
          setData(res);
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load analytics');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id, from, to]);

  if (authLoading) {
    return <p className="p-8 text-center text-ink/50">Loading…</p>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const analytics = data?.analytics;

  function applyPreset(next) {
    setPreset(next);
    const range = rangeForPreset(next);
    setFrom(range.from);
    setTo(range.to);
  }

  function onCustomFrom(value) {
    setPreset('custom');
    setFrom(value);
  }

  function onCustomTo(value) {
    setPreset('custom');
    setTo(value);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/dashboard" className="text-sm text-sea hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          {data?.url && (
            <p className="mt-1 font-mono text-sm text-ink/55">
              /{data.url.code}
              {data.url.title ? ` · ${data.url.title}` : ''}
              {data.url.deletedAt ? ' · in trash' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-1 rounded-xl border border-ink/10 bg-white/70 p-1 text-xs sm:text-sm">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  preset === p.id
                    ? 'bg-ink text-white'
                    : 'text-ink/60 hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <input
              type="date"
              value={from}
              onChange={(e) => onCustomFrom(e.target.value)}
              className="rounded-lg border border-ink/10 bg-white px-3 py-2"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => onCustomTo(e.target.value)}
              className="rounded-lg border border-ink/10 bg-white px-3 py-2"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {!data && !error && (
        <p className="mt-10 text-center text-ink/45">Loading analytics…</p>
      )}

      {analytics && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total clicks"
              value={analytics.totalClicks}
              hint="In selected range"
            />
            <StatCard
              label="Unique visitors"
              value={analytics.uniqueVisitors}
              hint="Approx. by hashed IP"
            />
            <StatCard
              label="Avg / day"
              value={analytics.avgClicksPerDay}
              hint={
                analytics.peakDay
                  ? `Peak day ${analytics.peakDay.date} (${analytics.peakDay.count})`
                  : 'No peak day yet'
              }
            />
            <StatCard
              label="Countries"
              value={analytics.countriesReached}
              hint={
                analytics.peakHour
                  ? `Busiest hour ${analytics.peakHour.label}`
                  : 'No hourly peak yet'
              }
            />
          </div>

          <section className="rounded-2xl border border-ink/8 bg-white/80 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/45">
              Clicks over time
            </h2>
            <div className="h-64">
              {analytics.clicksOverTime.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.clicksOverTime}>
                    <defs>
                      <linearGradient id="fillSea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1f7a8c" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1f7a8c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a162814" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#1f7a8c"
                      fill="url(#fillSea)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-ink/8 bg-white/80 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/45">
              Clicks by hour of day
            </h2>
            <div className="h-52">
              {(analytics.clicksByHour || []).every((h) => h.count === 0) ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.clicksByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a162814" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      interval={2}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1f7a8c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Devices">
              <PieBlock data={analytics.devices} />
            </ChartCard>
            <ChartCard title="Browsers">
              <PieBlock data={analytics.browsers} />
            </ChartCard>
            <ChartCard title="Operating systems">
              <PieBlock data={analytics.operatingSystems} />
            </ChartCard>
            <ChartCard title="Top referrers">
              <div className="h-56">
                {!analytics.topReferrers?.length ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.topReferrers.map((r) => ({
                        ...r,
                        label: shorten(r.referrer, 28),
                      }))}
                      layout="vertical"
                      margin={{ left: 8, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#0a162814" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={100}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0b3d2e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
            <ChartCard title="Countries">
              <RankList
                items={analytics.countries}
                empty="No geo data yet"
                labelKey="country"
              />
            </ChartCard>
            <ChartCard title="Top cities">
              <RankList
                items={analytics.cities}
                empty="No city data yet"
                getLabel={(c) =>
                  c.city && c.city !== 'Unknown'
                    ? `${c.city}, ${c.country || 'Unknown'}`
                    : c.country || 'Unknown'
                }
              />
            </ChartCard>
          </div>

          {data.url?.longUrl && (
            <p className="truncate text-center text-xs text-ink/40">
              Destination: {data.url.longUrl}
            </p>
          )}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white/80 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
        {value ?? 0}
      </p>
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-ink/8 bg-white/80 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/45">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyChart() {
  return (
    <p className="grid h-full place-items-center text-sm text-ink/45">
      No data in this range
    </p>
  );
}

function RankList({ items, empty, labelKey, getLabel }) {
  if (!items?.length) {
    return <p className="py-8 text-center text-sm text-ink/45">{empty}</p>;
  }
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="max-h-56 space-y-2.5 overflow-y-auto text-sm">
      {items.map((item, idx) => {
        const label = getLabel
          ? getLabel(item)
          : item[labelKey] || 'Unknown';
        const pct = Math.round((item.count / max) * 100);
        return (
          <li key={`${label}-${idx}`}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="truncate">{label}</span>
              <span className="shrink-0 font-mono text-ink/55">{item.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
              <div
                className="h-full rounded-full bg-sea/70"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PieBlock({ data }) {
  if (!data?.length) {
    return <EmptyChart />;
  }
  return (
    <div className="flex h-56 items-center gap-2">
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="max-h-52 w-[42%] space-y-1.5 overflow-y-auto text-xs text-ink/65">
        {data.map((d, i) => (
          <li key={`${d.name}-${i}`} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="truncate">{d.name || 'unknown'}</span>
            <span className="ml-auto font-mono text-ink/45">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function shorten(str, n) {
  if (!str) return 'direct';
  return str.length > n ? `${str.slice(0, n)}…` : str;
}
