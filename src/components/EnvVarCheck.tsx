'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * EnvVarCheck — Detects missing environment variables and shows a restart prompt.
 *
 * This is a development-time helper. If env vars are absent (e.g. the dev server
 * was started before .env.local was created), it blocks the UI with instructions.
 */
export function EnvVarCheck() {
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setNeedsRestart(true);
    }
  }, []);

  if (!needsRestart) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'white',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
      <h1 className="text-2xl font-bold mb-4">Server Restart Required</h1>
      <p className="mb-6 max-w-md text-gray-300">
        The application cannot read the new <code>.env.local</code> file because
        the server hasn&apos;t been restarted.
      </p>

      <div className="bg-gray-800 p-6 rounded-lg text-left font-mono text-sm mb-6 border border-gray-700">
        <p className="text-green-400 mb-2"># In your terminal:</p>
        <p className="mb-2">
          1. Press <span className="text-yellow-400 font-bold">Ctrl + C</span> to stop the server
        </p>
        <p className="mb-2">
          2. Run <span className="text-yellow-400 font-bold">npm run dev</span> again
        </p>
        <p>3. Refresh this page</p>
      </div>

      <Button onClick={() => window.location.reload()}>
        I&apos;ve Restarted the Server
      </Button>
    </div>
  );
}
