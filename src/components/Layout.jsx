import { LogOut, LayoutDashboard, Columns3, Table2, Plus } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'kanban',    label: 'Pipeline', icon: Columns3 },
  { id: 'table',     label: 'Register', icon: Table2 },
];

export default function Layout({ user, onSignOut, tab, setTab, onNewLead, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
                Skon Studio
              </div>
              <div className="font-display text-2xl font-light leading-none mt-0.5" style={{ letterSpacing: '-0.01em' }}>
                Atelier
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 ml-6">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase flex items-center gap-2 transition-colors"
                    style={{
                      color: active ? 'var(--color-text)' : 'var(--color-muted)',
                      borderBottom: active ? '1px solid var(--color-gold)' : '1px solid transparent',
                    }}
                  >
                    <Icon size={13} strokeWidth={1.5} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNewLead}
              className="flex items-center gap-2 px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-all"
              style={{ background: 'var(--color-text)', color: 'var(--color-bg)' }}
            >
              <Plus size={13} strokeWidth={2} />
              New Lead
            </button>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--color-muted)' }}>
                Signed in
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                {user?.email}
              </span>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="p-2 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <nav className="md:hidden flex border-t" style={{ borderColor: 'var(--color-border)' }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 px-4 py-3 text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                style={{
                  color: active ? 'var(--color-text)' : 'var(--color-muted)',
                  borderBottom: active ? '1px solid var(--color-gold)' : '1px solid transparent',
                }}
              >
                <Icon size={12} strokeWidth={1.5} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="px-8 py-6 mt-12 border-t text-[10px] tracking-[0.3em] uppercase flex justify-between"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-faint)' }}>
        <span>© Skon Studio</span>
        <span>Live · synced via Supabase</span>
      </footer>
    </div>
  );
}
