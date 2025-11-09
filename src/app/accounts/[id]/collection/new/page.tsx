'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Route } from 'next';

export default function AccountCollectionNewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const accountId = params?.id;

  const [accName, setAccName] = useState('');
  const [groupName] = useState('MÜŞTERİLER');
  const [authorized] = useState('Ahmet Bey');

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentType, setPaymentType] = useState('Nakit');
  const [docNo, setDocNo] = useState('');
  const [cash, setCash] = useState('Varsayılan Kasa');
  const [description, setDescription] = useState('Tahsilat');
  const [amount, setAmount] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: a } = await supabase.from('accounts').select('id, name').eq('id', accountId).single();
      setAccName((a as any)?.name ?? '');
    };
    if (accountId) load();
  }, [accountId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!accountId || typeof amount !== 'number' || amount <= 0) {
      setErr('Tutar zorunlu');
      return;
    }
    setSaving(true);
    try {
      // Demo: veritabanı satırı yazmadan geri dön (entegrasyon eklenebilir)
      alert('Tahsilat kaydı oluşturuldu (demo).');
      router.push((`/accounts/${accountId}`) as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Tahsilat yapılamadı');
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16 }}>
        {/* Cari Bilgileri */}
        <section style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Cari Bilgileri</div>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 6, columnGap: 8 }}>
            <div>Firma Adı :</div><div>{accName || '-'}</div>
            <div>Grup :</div><div>{groupName}</div>
            <div>Yetkili :</div><div>{authorized}</div>
          </div>
        </section>

        {/* Tahsilat Formu */}
        <section style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Tahsilat Yap</div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 540 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>İşlem Tarihi :</div>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Vade Tarihi :</div>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Ödeme Şekli :</div>
              <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                <option>Nakit</option>
                <option>Havale</option>
                <option>Kredi Kartı</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Evrak No :</div>
              <input value={docNo} onChange={(e) => setDocNo(e.target.value)} placeholder="Evrak No" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Kasa :</div>
              <select value={cash} onChange={(e) => setCash(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                <option>Varsayılan Kasa</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Açıklama :</div>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tahsilat" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>İşlem Tutarı :</div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
            <div>
              <button disabled={saving} type="submit" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: '#1ea7fd', color: 'white', cursor: 'pointer' }}>
                {saving ? 'Kaydediliyor…' : '💵 Tahsilat Yap'}
              </button>
              <button type="button" onClick={() => router.push((`/accounts/${accountId}`) as Route)} style={{ marginLeft: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>
                Geri
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}


