import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { STAGES, LEAD_TYPES, SOURCES, PROJECT_TYPES, BUDGET_RANGES } from '../lib/supabase.js';

const EMPTY = {
  lead_type: 'B2B',
  date_received: new Date().toISOString().slice(0, 10),
  prospect_name: '',
  company_name: '',
  job_title: '',
  email: '',
  phone: '',
  source: '',
  project_type: '',
  budget_range: '',
  status: '',
  notes: '',
  stage: 'New',
};

export default function LeadEditor({ lead, onClose, onCreate, onUpdate, onDelete }) {
  const isNew = !lead?.id;
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(lead ?? {}) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setForm({ ...EMPTY, ...(lead ?? {}) }); }, [lead]);

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      // Strip server-managed fields and empty strings
      const {
        id, created_at, updated_at, created_by, updated_by, ...rest
      } = form;
      const payload = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, v === '' ? null : v])
      );
      payload.prospect_name = form.prospect_name || 'Untitled lead';
      if (isNew) {
        await onCreate(payload);
      } else {
        await onUpdate(lead.id, payload);
      }
      onClose();
    } catch (err) {
      setError(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead permanently?')) return;
    setBusy(true);
    try { await onDelete(lead.id); onClose(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
         style={{ background: 'rgba(22,22,29,0.4)' }}
         onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl h-full overflow-y-auto"
        style={{ background: 'var(--color-bg)', borderLeft: '1px solid var(--color-border)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 border-b"
             style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
              {isNew ? 'New entry' : 'Edit lead'}
            </div>
            <h3 className="font-display text-3xl font-light mt-1" style={{ letterSpacing: '-0.02em' }}>
              {form.prospect_name || 'Untitled'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2" style={{ color: 'var(--color-muted)' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={submit} className="px-8 py-8 space-y-7">
          <Row>
            <Field label="Lead type">
              <SelectInput value={form.lead_type} onChange={set('lead_type')}
                           options={LEAD_TYPES} />
            </Field>
            <Field label="Stage">
              <SelectInput value={form.stage} onChange={set('stage')} options={STAGES} />
            </Field>
          </Row>

          <Row>
            <Field label="Date received">
              <Input type="date" value={form.date_received ?? ''} onChange={set('date_received')} />
            </Field>
            <Field label="Source">
              <FreeSelect value={form.source ?? ''} onChange={set('source')} options={SOURCES} />
            </Field>
          </Row>

          <Field label={form.lead_type === 'B2C' ? 'Client name' : "Prospect's name"}>
            <Input value={form.prospect_name ?? ''} onChange={set('prospect_name')} required />
          </Field>

          {form.lead_type === 'B2B' && (
            <Field label="Company">
              <Input value={form.company_name ?? ''} onChange={set('company_name')} />
            </Field>
          )}

          <Field label="Job title">
            <Input value={form.job_title ?? ''} onChange={set('job_title')} />
          </Field>

          <Row>
            <Field label="Email">
              <Textarea rows={2} value={form.email ?? ''} onChange={set('email')}
                        placeholder="One per line for multiple addresses" />
            </Field>
            <Field label="Phone">
              <Textarea rows={2} value={form.phone ?? ''} onChange={set('phone')}
                        placeholder="One per line for multiple numbers" />
            </Field>
          </Row>

          <Row>
            <Field label="Project type">
              <FreeSelect value={form.project_type ?? ''} onChange={set('project_type')} options={PROJECT_TYPES} />
            </Field>
            <Field label="Budget range">
              <FreeSelect value={form.budget_range ?? ''} onChange={set('budget_range')} options={BUDGET_RANGES} />
            </Field>
          </Row>

          <Field label="Status / outreach log">
            <Textarea rows={4} value={form.status ?? ''} onChange={set('status')}
                      placeholder={'Email Sent\nCall Not Answered\nLinkedIn Message Sent'} />
          </Field>

          <Field label="Notes">
            <Textarea rows={3} value={form.notes ?? ''} onChange={set('notes')} />
          </Field>

          {error && (
            <div className="text-xs" style={{ color: '#9B2C2C' }}>{error}</div>
          )}

          <div className="flex items-center justify-between pt-4 border-t"
               style={{ borderColor: 'var(--color-border)' }}>
            {!isNew ? (
              <button type="button" onClick={handleDelete} disabled={busy}
                      className="text-[11px] tracking-[0.2em] uppercase flex items-center gap-2 py-2"
                      style={{ color: '#9B2C2C' }}>
                <Trash2 size={13} strokeWidth={1.5} /> Delete
              </button>
            ) : <span />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                      className="px-5 py-3 text-[11px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                Cancel
              </button>
              <button type="submit" disabled={busy}
                      className="px-6 py-3 text-[11px] tracking-[0.2em] uppercase"
                      style={{ background: 'var(--color-text)', color: 'var(--color-bg)', opacity: busy ? 0.5 : 1 }}>
                {busy ? 'Saving…' : isNew ? 'Create lead' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.25em] uppercase mb-2"
            style={{ color: 'var(--color-muted)' }}>{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input {...props}
           className="w-full bg-transparent border-0 border-b py-2 text-sm focus:outline-none"
           style={{ borderColor: 'var(--color-border)' }} />
  );
}

function Textarea(props) {
  return (
    <textarea {...props}
              className="w-full bg-transparent border py-2 px-3 text-sm focus:outline-none resize-y"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }} />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value ?? ''} onChange={onChange}
            className="w-full bg-transparent border-0 border-b py-2 text-sm focus:outline-none"
            style={{ borderColor: 'var(--color-border)' }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/** Datalist-backed input — choose from a list OR type a new value. */
function FreeSelect({ value, onChange, options }) {
  const id = 'fs-' + options.join('').replace(/\W/g, '').slice(0, 10);
  return (
    <>
      <input list={id} value={value ?? ''} onChange={onChange}
             className="w-full bg-transparent border-0 border-b py-2 text-sm focus:outline-none"
             style={{ borderColor: 'var(--color-border)' }} />
      <datalist id={id}>
        {options.map((o) => <option key={o} value={o} />)}
      </datalist>
    </>
  );
}
