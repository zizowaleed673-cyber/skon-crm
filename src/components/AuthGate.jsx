import { useState } from 'react';

export default function AuthGate({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await onSignIn(email, password);
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,169,97,0.18), transparent 70%), var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-12 reveal">
          <div className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'var(--color-gold)' }}>
            Skon Studio
          </div>
          <h1 className="font-display font-light text-6xl leading-none" style={{ letterSpacing: '-0.02em' }}>
            Atelier
          </h1>
          <div className="mt-6 mx-auto w-16 divider-gold" />
          <p className="mt-6 text-sm" style={{ color: 'var(--color-muted)' }}>
            Private client &amp; project intelligence
          </p>
        </div>

        <form onSubmit={submit} className="reveal" style={{ animationDelay: '0.15s' }}>
          <div className="space-y-5">
            <Field label="Email">
              <input
                type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b py-2 text-base focus:outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </Field>
            <Field label="Password">
              <input
                type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b py-2 text-base focus:outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </Field>
          </div>

          {error && (
            <div className="mt-5 text-xs" style={{ color: '#9B2C2C' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-10 w-full py-4 text-[11px] tracking-[0.3em] uppercase transition-all"
            style={{
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              opacity: busy ? 0.5 : 1,
            }}
          >
            {busy ? 'Entering…' : 'Enter'}
          </button>
        </form>

        <p className="mt-8 text-center text-[11px]" style={{ color: 'var(--color-faint)' }}>
          Access is invitation-only. Contact the studio principal to request entry.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.25em] uppercase mb-2"
            style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  );
}
