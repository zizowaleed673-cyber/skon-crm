import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Fail loud during development so you don't ship a broken bundle.
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in your Supabase project values.'
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } },
});

export const STAGES = [
  'New',
  'Contacted',
  'In Discussion',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const LEAD_TYPES = ['B2B', 'B2C'];

export const SOURCES = [
  'Lusha',
  'LinkedIn',
  'Referral',
  'Website',
  'Instagram',
  'Email Campaign',
  'Event',
  'Other',
];

export const PROJECT_TYPES = [
  'Commercial Interior Design',
  'Luxury Residential',
  'Hospitality',
  'Retail Build-out',
  'Office Fit-out',
  'Renovation',
  'Other',
];

export const BUDGET_RANGES = [
  '< $50k',
  '$50k – $250k',
  '$250k – $1M',
  '$1M – $5M',
  '$5M+',
  'TBD',
];
