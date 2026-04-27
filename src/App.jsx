import { useState } from 'react';
import { useAuth } from './lib/useAuth.js';
import { useLeads } from './lib/useLeads.js';
import AuthGate from './components/AuthGate.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import Kanban from './components/Kanban.jsx';
import LeadsTable from './components/LeadsTable.jsx';
import LeadEditor from './components/LeadEditor.jsx';

export default function App() {
  const { user, session, loading: authLoading, signIn, signOut } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [editing, setEditing] = useState(null); // null | {} for new | lead object for edit

  if (authLoading) return <Splash />;
  if (!session)    return <AuthGate onSignIn={signIn} />;

  return <SignedIn user={user} signOut={signOut} tab={tab} setTab={setTab}
                   editing={editing} setEditing={setEditing} />;
}

function SignedIn({ user, signOut, tab, setTab, editing, setEditing }) {
  const { leads, loading, error, createLead, updateLead, deleteLead } = useLeads();

  return (
    <Layout user={user} onSignOut={signOut} tab={tab} setTab={setTab}
            onNewLead={() => setEditing({})}>
      {error && (
        <div className="mx-8 mt-6 p-4 text-xs" style={{ background: 'rgba(155,44,44,0.08)', color: '#9B2C2C' }}>
          {error}
        </div>
      )}
      {loading ? <Splash inline /> : (
        <>
          {tab === 'dashboard' && <Dashboard leads={leads} />}
          {tab === 'kanban'    && <Kanban leads={leads} onUpdate={updateLead} onSelect={setEditing} />}
          {tab === 'table'     && <LeadsTable leads={leads} onSelect={setEditing} />}
        </>
      )}

      {editing !== null && (
        <LeadEditor
          lead={editing}
          onClose={() => setEditing(null)}
          onCreate={createLead}
          onUpdate={updateLead}
          onDelete={deleteLead}
        />
      )}
    </Layout>
  );
}

function Splash({ inline }) {
  return (
    <div className={inline ? 'py-32' : 'min-h-screen'}
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-center">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>
          Skon Studio
        </div>
        <div className="font-display text-5xl font-light mt-3 italic" style={{ color: 'var(--color-muted)' }}>
          loading…
        </div>
      </div>
    </div>
  );
}
