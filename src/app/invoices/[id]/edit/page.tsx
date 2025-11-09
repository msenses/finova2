'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { fetchCurrentCompanyId } from '@/lib/company';

type Account = { id: string; name: string };
type Product = { id: string; name: string; vat_rate: number; price: number; unit: string };
type Line = { id?: string; product_id: string | null; name: string; qty: number; unit_price: number; vat_rate: number };

export default function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [type, setType] = useState<'sales' | 'purchase'>('sales');
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      const { data: inv } = await supabase.from('invoices').select('invoice_no, invoice_date, type, account_id').eq('id', id).single();
      if (inv) {
        setInvoiceNo((inv as any).invoice_no ?? '');
        setInvoiceDate((inv as any).invoice_date ?? '');
        setType((inv as any).type ?? 'sales');
        setAccountId((inv as any).account_id ?? '');
      }
      const { data: items } = await supabase.from('invoice_items').select('id, product_id, qty, unit_price, vat_rate').eq('invoice_id', id);
      setLines(((items ?? []) as any).map((it: any) => ({ id: it.id, product_id: it.product_id, name: '', qty: it.qty, unit_price: it.unit_price, vat_rate: it.vat_rate })));
      setLoading(false);
    };
    if (id) init();
  }, [id, router]);

  const totals = useMemo(() => {
    const net = lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
    const vat = lines.reduce((s, l) => s + (l.qty * l.unit_price * l.vat_rate) / 100, 0);
    return { net: round2(net), vat: round2(vat), total: round2(net + vat) };
  }, [lines]);

  const setLine = (idx: number, patch: Partial<Line>) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
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
      await supabase.from('invoices').update({ invoice_no: invoiceNo || null, invoice_date: invoiceDate, type, account_id: accountId, net_total: totals.net, vat_total: totals.vat, total: totals.total }).eq('id', id);
      // basit strateji: eski kalemleri ve stok hareketlerini silip yeniden yaz
      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      await supabase.from('stock_movements').delete().eq('invoice_id', id);
      const itemRows = lines.map((l) => ({
        invoice_id: id,
        product_id: l.product_id,
        qty: l.qty,
        unit_price: l.unit_price,
        vat_rate: l.vat_rate,
        line_total: round2(l.qty * l.unit_price + (l.qty * l.unit_price * l.vat_rate) / 100),
      }));
      await supabase.from('invoice_items').insert(itemRows);
      const moveRows = lines.filter((l) => l.product_id).map((l) => ({
        company_id: companyId,
        product_id: l.product_id!,
        invoice_id: id,
        move_type: type === 'sales' ? 'out' : 'in',
        qty: l.qty,
      }));
      if (moveRows.length) await supabase.from('stock_movements').insert(moveRows as any);
      router.push('/invoices');
    } catch (e: any) {
      setErr(e?.message ?? 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>Yükleniyor…</main>;
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>Fatura Düzenle</strong>
      </header>
      <section style={{ padding: 16 }}>
        <form onSubmit={submit} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Tür</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="sales">Satış</option>
                  <option value="purchase">Alış</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Tarih</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Fatura No</label>
                <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="Otomatik" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, opacity: 0.9 }}>Cari</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option value="">Seçin…</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                    <th style={{ padding: '10px 8px' }}>Ürün</th>
                    <th style={{ padding: '10px 8px' }}>Miktar</th>
                    <th style={{ padding: '10px 8px' }}>Birim Fiyat</th>
                    <th style={{ padding: '10px 8px' }}>KDV %</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Tutar</th>
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
                          <input type="number" step="0.001" value={l.qty} onChange={(e) => setLine(idx, { qty: parseFloat(e.target.value) || 0 })} style={{ width: 100, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.unit_price} onChange={(e) => setLine(idx, { unit_price: parseFloat(e.target.value) || 0 })} style={{ width: 120, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input type="number" step="0.01" value={l.vat_rate} onChange={(e) => setLine(idx, { vat_rate: parseFloat(e.target.value) || 0 })} style={{ width: 80, padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
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
              <div style={{ marginTop: 8 }}>
                <button type="button" onClick={addLine} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Satır Ekle</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div />
              <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Net</span><strong>{totals.net.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>KDV</span><strong>{totals.vat.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Toplam</span><strong>{totals.total.toFixed(2)}</strong></div>
              </div>
            </div>

            {err && <div style={{ color: '#ffb4b4' }}>{err}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => router.push('/invoices')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
              <button disabled={loading} type="submit" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>{loading ? 'Kaydediliyor…' : 'Güncelle'}</button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }


