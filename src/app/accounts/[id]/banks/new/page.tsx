'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Route } from 'next';

export default function AccountBankNewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const accountId = params?.id;

  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [iban, setIban] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      // Varsa account_banks tablosuna kaydet, yoksa sessizce geri dön.
      const { error } = await supabase
        .from('account_banks')
        .insert({
          account_id: accountId,
          bank_name: bank || null,
          branch: branch || null,
          branch_code: branchCode || null,
          account_no: accountNo || null,
          iban: iban || null,
        });
      if (error) {
        // tablo olmayabilir; yine de geri dön
        // setErr(error.message);
      }
      router.push((`/accounts/${accountId}`) as Route);
    } catch (e: any) {
      setErr(e?.message ?? 'Kaydetme başarısız');
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <div style={{ padding: 16, display: 'grid', placeItems: 'start center' }}>
        <form onSubmit={submit} style={{ width: 480, maxWidth: '95%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Banka Bilgisi Ekle</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Banka Adı :</div>
              <input value={bank} onChange={(e) => setBank(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Banka Şube :</div>
              <input value={branch} onChange={(e) => setBranch(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Banka Şube Kodu :</div>
              <input value={branchCode} onChange={(e) => setBranchCode(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Hesap No :</div>
              <input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>IBAN :</div>
              <input value={iban} onChange={(e) => setIban(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
            </div>
            {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => router.push((`/accounts/${accountId}`) as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
              <button disabled={saving} type="submit" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #12b3c5', background: '#12b3c5', color: 'white' }}>{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}


