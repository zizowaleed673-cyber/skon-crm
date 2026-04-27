import { useState } from 'react';
import { STAGES } from '../lib/supabase.js';
import { GripVertical } from 'lucide-react';

/**
 * Drag-and-drop kanban using native HTML5 DnD (no extra dependency).
 * Drop a card on a column → updates the lead's stage in Supabase →
 * realtime pushes the change to your partner's screen.
 */
export default function Kanban({ leads, onUpdate, onSelect }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const grouped = STAGES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.stage === s);
    return acc;
  }, {});

  const handleDrop = async (stage) => {
    if (!draggedId) return;
    const lead = leads.find((l) => l.id === draggedId);
    if (lead && lead.stage !== stage) {
      try { await onUpdate(draggedId, { stage }); }
      catch (e) { console.error('Move failed', e); alert('Could not move lead: ' + e.message); }
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
            Pipeline
          </div>
          <h2 className="font-display text-4xl font-light mt-1" style={{ letterSpacing: '-0.02em' }}>
            Movement
          </h2>
        </div>
        <p className="text-xs hidden md:block" style={{ color: 'var(--color-muted)' }}>
          Drag cards between columns to change stage. Click a card to edit.
        </p>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-6">
        {STAGES.map((stage) => {
          const items = grouped[stage];
          const isDragOver = dragOverStage === stage;
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={() => handleDrop(stage)}
              className="flex-shrink-0 w-72 rounded-none transition-colors"
              style={{
                background: isDragOver ? 'rgba(201,169,97,0.08)' : 'var(--color-surface)',
                outline: isDragOver ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
              }}
            >
              <div className="px-4 py-3 flex items-baseline justify-between border-b"
                   style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--color-muted)' }}>
                  {stage}
                </span>
                <span className="font-display text-xl font-light tabular">{items.length}</span>
              </div>

              <div className="p-3 space-y-2 min-h-[400px]">
                {items.length === 0 && (
                  <div className="text-[10px] tracking-[0.2em] uppercase italic text-center py-12"
                       style={{ color: 'var(--color-faint)' }}>
                    Empty
                  </div>
                )}
                {items.map((lead) => (
                  <Card
                    key={lead.id}
                    lead={lead}
                    onSelect={() => onSelect(lead)}
                    onDragStart={() => setDraggedId(lead.id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ lead, onSelect, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className="group cursor-grab active:cursor-grabbing px-3 py-3 transition-all hover:-translate-y-px"
      style={{
        background: 'var(--color-bg)',
        outline: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={12} className="mt-0.5 flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{lead.prospect_name}</div>
          {lead.company_name && (
            <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {lead.company_name}
            </div>
          )}
          {lead.job_title && (
            <div className="text-[10px] truncate mt-1 italic" style={{ color: 'var(--color-faint)' }}>
              {lead.job_title}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5"
                  style={{ background: lead.lead_type === 'B2B' ? 'rgba(139,111,63,0.12)' : 'rgba(201,169,97,0.18)', color: 'var(--color-gold)' }}>
              {lead.lead_type}
            </span>
            {lead.source && (
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                · {lead.source}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
