'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Invoice = {
  id: string;
  invoice_no: string | null;
  invoice_date: string;
  type: 'sales' | 'purchase';
  net_total: number;
  vat_total: number;
  total: number;
  accounts: { name: string } | null;
};

export default function InvoicesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'sales' | 'purchase' | 'all'>('all');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      const query = supabase
        .from('invoices')
        .select('id, invoice_no, invoice_date, type, net_total, vat_total, total, accounts(name)')
        .order('invoice_date', { ascending: false })
        .limit(50);
      if (type !== 'all') {
        query.eq('type', type);
      }
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        setRows([]);
      } else {
        setRows((data ?? []) as unknown as Invoice[]);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [router, type]);

  const table = useMemo(() => (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
          <th style={{ padding: '10px 8px' }}>No</th>
          <th style={{ padding: '10px 8px' }}>Tarih</th>
          <th style={{ padding: '10px 8px' }}>Cari</th>
          <th style={{ padding: '10px 8px' }}>Tür</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>Net</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>KDV</th>
          <th style={{ padding: '10px 8px', textAlign: 'right' }}>Toplam</th>
          <th style={{ padding: '10px 8px' }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} style={{ color: 'white' }}>
            <td style={{ padding: '8px' }}>{r.invoice_no ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.invoice_date}</td>
            <td style={{ padding: '8px' }}>{r.accounts?.name ?? '-'}</td>
            <td style={{ padding: '8px' }}>{r.type === 'sales' ? 'Satış' : 'Alış'}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.net_total ?? 0).toFixed(2)}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.vat_total ?? 0).toFixed(2)}</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{Number(r.total ?? 0).toFixed(2)}</td>
            <td style={{ padding: '8px' }}>
              <button onClick={() => router.push(`/invoices/${r.id}/edit`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Düzenle</button>
            </td>
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td colSpan={8} style={{ padding: 16, color: 'white', opacity: 0.8 }}>{loading ? 'Yükleniyor…' : 'Kayıt yok'}</td>
          </tr>
        )}
      </tbody>
    </table>
  ), [rows, router, loading]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Faturalar</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
            <option value="all">Tümü</option>
            <option value="sales">Satış</option>
            <option value="purchase">Alış</option>
          </select>
          <button onClick={() => router.push('/invoices/new?sales=1')} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Yeni Satış</button>
          <button onClick={() => router.push('/invoices/new?purchase=1')} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Yeni Alış</button>
        </div>
      </header>
      <section style={{ padding: 16 }}>
        <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          {table}
        </div>
      </section>
    </main>
  );
}


