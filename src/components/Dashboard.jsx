import { useMemo } from 'react';
import { STAGES } from '../lib/supabase.js';

export default function Dashboard({ leads }) {
  const stats = useMemo(() => computeStats(leads), [leads]);

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      <header className="mb-16 reveal">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
          Overview
        </div>
        <h1 className="font-display font-light text-6xl md:text-7xl mt-3 leading-[0.95]"
            style={{ letterSpacing: '-0.02em' }}>
          The pipeline,<br/>
          <span style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>at a glance.</span>
        </h1>
        <div className="mt-8 w-24 divider-gold" />
      </header>

      {/* Hero metrics — large numerals, editorial scale */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px mb-px"
               style={{ background: 'var(--color-border)' }}>
        <Metric eyebrow="Total leads"        value={stats.total}        sub={`${stats.b2b} B2B · ${stats.b2c} B2C`} />
        <Metric eyebrow="Active pipeline"    value={stats.active}       sub={`${stats.activePct}% of leads in motion`} />
        <Metric eyebrow="Closed this month"  value={stats.wonThisMonth} sub={`${stats.lostThisMonth} lost`} accent />
      </section>

      {/* Stage distribution */}
      <section className="mt-20 reveal">
        <SectionTitle>By stage</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          {STAGES.map((stage) => {
            const count = stats.byStage[stage] ?? 0;
            const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={stage} className="reveal" style={{ background: 'var(--color-surface)', padding: '1.25rem 1rem' }}>
                <div className="font-display font-light text-4xl tabular leading-none">{count}</div>
                <div className="mt-3 text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-muted)' }}>
                  {stage}
                </div>
                <div className="mt-3 h-px w-full" style={{ background: 'var(--color-border)' }}>
                  <div className="h-px" style={{ background: 'var(--color-gold)', width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two-column: by source + recent */}
      <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <SectionTitle>By source</SectionTitle>
          <div className="mt-6 space-y-3">
            {stats.bySourceList.length === 0 && (
              <Empty>No source data yet.</Empty>
            )}
            {stats.bySourceList.map(([src, count]) => (
              <div key={src} className="flex items-baseline justify-between py-3 border-b"
                   style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm">{src}</span>
                <span className="font-display text-2xl font-light tabular">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Recent activity</SectionTitle>
          <div className="mt-6 space-y-3">
            {stats.recent.length === 0 && <Empty>No recent leads.</Empty>}
            {stats.recent.map((l) => (
              <div key={l.id} className="py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{l.prospect_name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                      {l.company_name || (l.lead_type === 'B2C' ? 'Private client' : '—')}
                    </div>
                  </div>
                  <div className="text-[10px] tracking-[0.2em] uppercase whitespace-nowrap"
                       style={{ color: 'var(--color-gold)' }}>
                    {l.stage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ eyebrow, value, sub, accent }) {
  return (
    <div className="px-8 py-10 reveal" style={{ background: 'var(--color-surface)' }}>
      <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--color-muted)' }}>
        {eyebrow}
      </div>
      <div className="font-display font-light text-7xl md:text-8xl tabular mt-4 leading-none"
           style={{ color: accent ? 'var(--color-gold)' : 'var(--color-text)', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 max-w-8" style={{ background: 'var(--color-gold)' }} />
      <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-muted)' }}>
        {children}
      </span>
    </div>
  );
}

function Empty({ children }) {
  return <div className="text-xs italic py-6" style={{ color: 'var(--color-faint)' }}>{children}</div>;
}

function computeStats(leads) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const sameMonth = (l) => {
    const d = l.updated_at ? new Date(l.updated_at) : null;
    return d && `${d.getFullYear()}-${d.getMonth()}` === monthKey;
  };

  const byStage = {};
  STAGES.forEach((s) => { byStage[s] = 0; });
  leads.forEach((l) => { if (byStage[l.stage] !== undefined) byStage[l.stage] += 1; });

  const bySource = {};
  leads.forEach((l) => {
    const k = l.source?.trim() || 'Unspecified';
    bySource[k] = (bySource[k] || 0) + 1;
  });

  const total = leads.length;
  const active = leads.filter((l) => !['Won', 'Lost'].includes(l.stage)).length;
  const won = leads.filter((l) => l.stage === 'Won');
  const lost = leads.filter((l) => l.stage === 'Lost');

  return {
    total,
    active,
    activePct: total ? Math.round((active / total) * 100) : 0,
    b2b: leads.filter((l) => l.lead_type === 'B2B').length,
    b2c: leads.filter((l) => l.lead_type === 'B2C').length,
    wonThisMonth: won.filter(sameMonth).length,
    lostThisMonth: lost.filter(sameMonth).length,
    byStage,
    bySourceList: Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 8),
    recent: [...leads]
      .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      .slice(0, 6),
  };
}
