'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Account = { id: string; name: string };
type Product = { id: string; name: string; vat_rate: number; price: number; unit: string };

type Line = {
  product_id: string | null;
  name: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
};

export default function InvoiceNewClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const defaultType = search.get('purchase') ? 'purchase' : 'sales';

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [type, setType] = useState<'sales' | 'purchase'>(defaultType as any);
  const [invoiceDate, setInvoiceDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [invoiceNo, setInvoiceNo] = useState('');
  const [accountId, setAccountId] = useState<string>(typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? ''));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([{ product_id: null, name: '', qty: 1, unit_price: 0, vat_rate: 20 }]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const cid = await fetchCurrentCompanyId();
      setCompanyId(cid);
      const [{ data: accs }, { data: prods }] = await Promise.all([
        supabase.from('accounts').select('id, name').order('name', { ascending: true }).limit(500),
        supabase.from('products').select('id, name, vat_rate, price, unit').order('name', { ascending: true }).limit(500),
      ]);
      setAccounts((accs ?? []) as any);
      setProducts((prods ?? []) as any);
    };
    init();
  }, [router]);

  const totals = useMemo(() => {
    const net = lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
    const vat = lines.reduce((s, l) => s + (l.qty * l.unit_price * l.vat_rate) / 100, 0);
    return { net: round2(net), vat: round2(vat), total: round2(net + vat) };
  }, [lines]);

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { product_id: null, name: '', qty: 1, unit_price: 0, vat_rate: 20 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_l, i) => i !== idx));

  const onProductSelect = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      setLine(idx, { product_id: p.id, name: p.name, unit_price: p.price ?? 0, vat_rate: p.vat_rate ?? 0 });
    } else {
      setLine(idx, { product_id: null });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (!companyId) throw new Error('Şirket bilgisi alınamadı');
      if (!accountId) throw new Error('Cari seçin');
      if (lines.length === 0) throw new Error('En az bir satır ekleyin');
      const { data: invData, error: invErr } = await supabase
        .from('invoices')
        .insert({
          company_id: companyId,
          account_id: accountId,
          type,
          invoice_no: invoiceNo || null,
          invoice_date: invoiceDate,
          net_total: totals.net,
          vat_total: totals.vat,
          total: totals.total,
        })
        .select('id')
        .single();
      if (invErr) throw invErr;
      const invoiceId = (invData as any).id as string;
      const itemRows = lines.map((l) => ({
        invoice_id: invoiceId,
        product_id: l.product_id,
        qty: l.qty,
        unit_price: l.unit_price,
        vat_rate: l.vat_rate,
        line_total: round2(l.qty * l.unit_price + (l.qty * l.unit_price * l.vat_rate) / 100),
      }));
      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemRows);
      if (itemsErr) throw itemsErr;
      const moveRows = lines.map((l) => ({
        company_id: companyId,
        product_id: l.product_id!,
        invoice_id: invoiceId,
        move_type: type === 'sales' ? 'out' : 'in',
        qty: l.qty,
      }));
      if (moveRows.every((m) => !!m.product_id)) {
        await supabase.from('stock_movements').insert(moveRows as any);
      }
      router.push('/invoices');
    } catch (e: any) {
      setErr(e?.message ?? 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Satış Faturası</strong>
      </header>
      <section style={{ padding: 16 }}>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          {/* Üst bloklar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: 12 }}>
            {/* Cari Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Cari Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Cari</div>
                  <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option value="">Seçiniz…</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Ünvan</div>
                  <input placeholder="Mehmet Bey" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Yetkili</div>
                  <input placeholder="Ahmet Bey" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Adres</div>
                  <input placeholder="Merkez" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Mail</div>
                  <input placeholder="mail@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Vergi Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Vergi Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi Dairesi</div>
                  <input placeholder="Üsküdar" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi No</div>
                  <input placeholder="12345678" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İl</div>
                  <input placeholder="Düzce" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İlçe</div>
                  <input placeholder="Merkez" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Fatura Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <button type="button" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Fatura Bilgileri</button>
                <button type="button" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(77,116,255,0.4)', background: 'rgba(77,116,255,0.25)', color: 'white' }}>Alış/Satış Ayarları</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura Tarihi</div>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Sevk Tarihi</div>
                  <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Saat</div>
                  <input type="time" defaultValue="13:43" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Fatura No</div>
                  <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Otomatik" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Barkod ve ürün ekle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <input placeholder="Barkod..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            <button type="button" onClick={addLine} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: '#e85b4a', color: 'white' }}>Ürün Ekle</button>
          </div>

          {/* Satır tablosu */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                    <th style={{ padding: '10px 8px' }}>Ürün</th>
                    <th style={{ padding: '10px 8px' }}>Ad</th>
                    <th style={{ padding: '10px 8px' }}>Miktar</th>
                    <th style={{ padding: '10px 8px' }}>Birim Fiyat</th>
                    <th style={{ padding: '10px 8px' }}>KDV %</th>
                    <th style={{ padding: '10px 8px' }}>İsk.%</th>
                    <th style={{ padding: '10px 8px' }}>İsk.TL</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>G.TOPLAM</th>
                    <th style={{ padding: '10px 8px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, idx) => {
                    const lineNet = round2(l.qty * l.unit_price);
                    const lineTotal = round2(lineNet + (lineNet * l.vat_rate) / 100);
                    return (
                      <tr key={idx} style={{ color: 'white' }}>
                        <td style={{ padding: '8px' }}>
                          <select value={l.product_id ?? ''} onChange={(e) => onProductSelect(idx, e.target.value)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                            <option value="">Seçin…</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input value={l.name} onChange={(e) => setLine(idx, { name: e.target.value })} placeholder="Satır açıklaması" style={{ width: 220, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.001" value={l.qty} onChange={(e) => setLine(idx, { qty: parseFloat(e.target.value) || 0 })} style={{ width: 100, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.unit_price} onChange={(e) => setLine(idx, { unit_price: parseFloat(e.target.value) || 0 })} style={{ width: 120, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.vat_rate} onChange={(e) => setLine(idx, { vat_rate: parseFloat(e.target.value) || 0 })} style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" step="0.01" value={0} disabled style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white', opacity: 0.6 }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input type="number" step="0.01" value={0} disabled style={{ width: 100, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white', opacity: 0.6 }} />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{lineTotal.toFixed(2)}</td>
                        <td style={{ padding: '8px' }}>
                          <button type="button" onClick={() => removeLine(idx)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>

          {/* Alt blok: Tutarlar + Açıklama/Ödeme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Tutarlar</div>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>İskonto</span><strong>0.00</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ara Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>KDV Tutar</span><strong>{totals.vat.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>ÖTV Tutar</span><strong>0.00</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}><span>G.Toplam</span><strong>{totals.total.toFixed(2)}</strong></div>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Açıklama</div>
                <input placeholder="Açıklama" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ödenen</div>
                  <input placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Depo Seçiniz</div>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Merkez</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Kasa Seçiniz</div>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Varsayılan Kasa</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ödeme Şekli</div>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>Nakit</option>
                    <option>Havale</option>
                    <option>Kredi Kartı</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                  <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Kaydet'}</button>
                </div>
              </div>
            </div>
          </div>

          {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
        </form>
      </section>
    </main>
  );
}

function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }


