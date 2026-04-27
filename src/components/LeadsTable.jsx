import { useMemo, useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { STAGES, LEAD_TYPES } from '../lib/supabase.js';

const COLS = [
  { id: 'lead_id',       label: '#',              width: 'w-12' },
  { id: 'date_received', label: 'Received',       width: 'w-28' },
  { id: 'lead_type',     label: 'Type',           width: 'w-16' },
  { id: 'prospect_name', label: 'Prospect',       width: 'w-48' },
  { id: 'company_name',  label: 'Company',        width: 'w-48' },
  { id: 'job_title',     label: 'Title',          width: 'w-44' },
  { id: 'source',        label: 'Source',         width: 'w-28' },
  { id: 'stage',         label: 'Stage',          width: 'w-32' },
  { id: 'status',        label: 'Status / Touch', width: '' },
];

export default function LeadsTable({ leads, onSelect }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [stage, setStage] = useState('all');
  const [sort, setSort] = useState({ key: 'date_received', dir: 'desc' });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = leads.filter((l) => {
      if (type !== 'all' && l.lead_type !== type) return false;
      if (stage !== 'all' && l.stage !== stage) return false;
      if (!needle) return true;
      return [
        l.prospect_name, l.company_name, l.job_title,
        l.email, l.phone, l.source, l.notes, l.status,
      ].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle));
    });

    rows.sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ?  1 : -1;
      return 0;
    });
    return rows;
  }, [leads, q, type, stage, sort]);

  const toggleSort = (key) => {
    setSort((s) => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' });
  };

  return (
    <div className="px-8 py-10">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
            Register
          </div>
          <h2 className="font-display text-4xl font-light mt-1" style={{ letterSpacing: '-0.02em' }}>
            All leads
          </h2>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Showing {filtered.length} of {leads.length}
        </span>
      </header>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-muted)' }} strokeWidth={1.5} />
          <input
            type="text" placeholder="Search prospects, companies, notes…"
            value={q} onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border focus:outline-none"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
        </div>
        <Select label="Type" value={type} onChange={setType}
                options={[{ v: 'all', l: 'All' }, ...LEAD_TYPES.map((t) => ({ v: t, l: t }))]} />
        <Select label="Stage" value={stage} onChange={setStage}
                options={[{ v: 'all', l: 'All' }, ...STAGES.map((s) => ({ v: s, l: s }))]} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ background: 'var(--color-surface)', outline: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              {COLS.map((c) => (
                <th key={c.id}
                    className={`${c.width} text-left px-3 py-3 text-[10px] tracking-[0.2em] uppercase font-normal cursor-pointer`}
                    style={{ color: 'var(--color-muted)' }}
                    onClick={() => toggleSort(c.id)}>
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sort.key === c.id && <ArrowUpDown size={10} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={COLS.length} className="py-16 text-center text-xs italic"
                      style={{ color: 'var(--color-faint)' }}>
                No leads match the current filters.
              </td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id}
                  onClick={() => onSelect(l)}
                  className="cursor-pointer border-b transition-colors hover:bg-[rgba(201,169,97,0.05)]"
                  style={{ borderColor: 'var(--color-border)' }}>
                <td className="px-3 py-3 tabular text-xs" style={{ color: 'var(--color-muted)' }}>
                  {l.lead_id ?? '—'}
                </td>
                <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                  {fmtDate(l.date_received)}
                </td>
                <td className="px-3 py-3">
                  <span className="text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5"
                        style={{ background: l.lead_type === 'B2B' ? 'rgba(139,111,63,0.12)' : 'rgba(201,169,97,0.18)', color: 'var(--color-gold)' }}>
                    {l.lead_type}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium">{l.prospect_name}</td>
                <td className="px-3 py-3" style={{ color: 'var(--color-muted)' }}>{l.company_name || '—'}</td>
                <td className="px-3 py-3 text-xs italic" style={{ color: 'var(--color-muted)' }}>{l.job_title || '—'}</td>
                <td className="px-3 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{l.source || '—'}</td>
                <td className="px-3 py-3">
                  <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-gold)' }}>
                    {l.stage}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs whitespace-pre-line max-w-md truncate"
                    style={{ color: 'var(--color-muted)' }}>
                  {l.status || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="text-sm px-3 py-2 bg-transparent border focus:outline-none"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(d); }
}
