'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Account = {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  balance: number;
};

export default function AccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Account[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const query = supabase
        .from('accounts')
        .select('id, code, name, phone, email, balance')
        .order('name', { ascending: true })
        .limit(50);
      if (q.trim()) {
        // Basit arama: name ilike veya code ilike
        // Supabase'de text search icin or kullanimi
        // Not: filter zinciri OR ile string olarak kurulur
        query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Account[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [q, router]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
          <th style={{ padding: '10px 8px' }}>Kod</th>
          <th style={{ padding: '10px 8px' }}>Ad</th>
          <th style={{ padding: '10px 8px' }}>Telefon</th>
          <th style={{ padding: '10px 8px' }}>E-posta</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>Bakiye</th>
          <th style={{ padding: '10px 8px' }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} style={{ color: 'white' }}>
            <td style={{ padding: '8px' }}>{r.code ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.name}</td>
            <td style={{ padding: '8px' }}>{r.phone ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.email ?? '-'}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.balance ?? 0).toFixed(2)}</td>
            <td style={{ padding: '8px' }}>
              <button onClick={() => router.push(`/accounts/${r.id}/edit`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
            </td>
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td colSpan={6} style={{ padding: 16, color: 'white', opacity: 0.8 }}>Kayıt yok</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [rows, router]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Cariler</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara (Ad/Kod)" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
          <button onClick={() => router.push('/accounts/new')} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Yeni Cari</button>
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {loading ? 'Yükleniyor…' : table}
        </div>
      </section>
    </main>
  );
}


