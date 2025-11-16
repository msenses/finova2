'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Account = { id: string; name: string };
type Product = { id: string; name: string; vat_rate: number; unit: string };

type Line = { name: string; qty: number; unit_price: number; vat_rate: number };

export default function DispatchNewClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const isPurchase = !!search.get('purchase');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [accountId, setAccountId] = useState<string>(typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? ''));
  const [accountName, setAccountName] = useState('');
  const [accountContact, setAccountContact] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [accountZip, setAccountZip] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [country, setCountry] = useState('Türkiye');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const [dispatchDate, setDispatchDate] = useState(today);
  const [shipmentDate, setShipmentDate] = useState(today);
  const [dispatchTime, setDispatchTime] = useState('13:54');
  const [dispatchNo, setDispatchNo] = useState('');
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [isEdispatch, setIsEdispatch] = useState(false);
  const [currency, setCurrency] = useState('Türk Lirası');
  const [dispatchType, setDispatchType] = useState('SEVK');

  // Sevk Bilgileri modal durumu ve alanları
  const [showShipmentInfo, setShowShipmentInfo] = useState(false);
  const [delivererName, setDelivererName] = useState('');
  const [delivererPhone, setDelivererPhone] = useState('');
  const [delivererFax, setDelivererFax] = useState('');
  const [delivererEmail, setDelivererEmail] = useState('');

  const [carrierTaxId, setCarrierTaxId] = useState('');
  const [carrierFirstName, setCarrierFirstName] = useState('');
  const [carrierLastName, setCarrierLastName] = useState('');
  const [carrierCountry, setCarrierCountry] = useState('');
  const [carrierCity, setCarrierCity] = useState('');
  const [carrierDistrict, setCarrierDistrict] = useState('');

  const [plateNo, setPlateNo] = useState('');
  const [drivers, setDrivers] = useState<Array<{ id: string; tckn: string; firstName: string; lastName: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; trailerPlateNo: string }>>([]);

  const [barcode, setBarcode] = useState('');
  const barcodeRef = useRef<HTMLInputElement | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const [{ data: accs }, { data: prods }] = await Promise.all([
        supabase.from('accounts').select('id, name').order('name', { ascending: true }).limit(500),
        supabase.from('products').select('id, name, vat_rate, unit').order('name', { ascending: true }).limit(500),
      ]);
      setAccounts((accs ?? []) as any);
      setProducts((prods ?? []) as any);
    };
    init();
  }, [router]);

  useEffect(() => {
    const loadAccount = async () => {
      if (!accountId) return;
      const { data } = await supabase.from('accounts').select('name, email, address').eq('id', accountId).single();
      if (data) {
        setAccountName(data.name ?? '');
        setAccountEmail(data.email ?? '');
        setAccountAddress(data.address ?? '');
      }
    };
    loadAccount();
  }, [accountId]);

  const totals = useMemo(() => {
    let net = 0;
    let vat = 0;
    for (const l of lines) {
      const lineNet = l.qty * l.unit_price;
      net += lineNet;
      vat += (lineNet * (l.vat_rate || 0)) / 100;
    }
    return { net, vat, total: net + vat };
  }, [lines]);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <strong>{isPurchase ? 'Alış İrsaliyesi' : 'Satış İrsaliyesi'}</strong>
      </header>
      <section style={{ padding: 16 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Üst bloklar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 420px', gap: 12 }}>
            {/* Cari Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Cari Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Ünvan</div>
                    {accountId ? (
                      <input value={accountName} onChange={(e) => setAccountName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    ) : (
                      <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                        <option value="">Seçiniz…</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    )}
                  </div>
                  <button type="button" onClick={() => { setAccountId(''); setAccountName(''); }} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>{accountId ? 'Değiştir' : 'Cari Seç'}</button>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Yetkili</div>
                  <input value={accountContact} onChange={(e) => setAccountContact(e.target.value)} placeholder="-" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Adres</div>
                  <input value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} placeholder="Adres" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Posta Kodu</div>
                  <input value={accountZip} onChange={(e) => setAccountZip(e.target.value)} placeholder="34000" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Mail</div>
                  <input value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} placeholder="mail@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Vergi Bilgileri */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, opacity: 0.95 }}>Vergi Bilgileri</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi Dairesi</div>
                  <input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} placeholder="Üsküdar" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Vergi No</div>
                  <input value={taxNo} onChange={(e) => setTaxNo(e.target.value)} placeholder="12345678" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Ülke</div>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Türkiye" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İl</div>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Düzce" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İlçe</div>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Merkez" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* İrsaliye Bilgileri (sağ üst) */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İrsaliye Tarihi</div>
                  <input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Sevk Tarihi</div>
                  <input type="date" value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Saat</div>
                  <input type="time" value={dispatchTime} onChange={(e) => setDispatchTime(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>İrsaliye No</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={dispatchNo} onChange={(e) => setDispatchNo(e.target.value)} placeholder="Otomatik" style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                    <button type="button" title="Yeni numara üret" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>+</button>
                  </div>
                </div>
              </div>
              {!isPurchase && (
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={isEcommerce} onChange={(e) => setIsEcommerce(e.target.checked)} />E-Ticaret Olarak İşle</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={isEdispatch} onChange={(e) => setIsEdispatch(e.target.checked)} />E-İrsaliye Olarak İşle</label>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>Para Birimleri</div>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option>Türk Lirası</option>
                      <option>Amerikan Doları</option>
                      <option>Euro</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select value={dispatchType} onChange={(e) => setDispatchType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                      <option value="SEVK">SEVK</option>
                      <option value="TESELLUM">TESELLÜM</option>
                    </select>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowShipmentInfo(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Sevk Bilgileri</button>
                      <button type="button" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2563eb', background: '#2563eb', color: 'white' }}>Alış Satış Ayarları</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sevk Adresi butonu */}
          <div>
            <button type="button" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Sevk Adresi</button>
          </div>

          {/* Barkod ve ürün ekle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <input ref={barcodeRef} value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Barkod..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'white' }} />
            <button type="button" onClick={() => setShowAddPanel(true)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: '#e85b4a', color: 'white' }}>Ürün Ekle</button>
          </div>

          {/* Tablo başlıkları (placeholder) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>Ad</th>
                  <th style={{ padding: '10px 8px' }}>Kdv</th>
                  <th style={{ padding: '10px 8px' }}>Ötv</th>
                  <th style={{ padding: '10px 8px' }}>Birim Fiyat</th>
                  <th style={{ padding: '10px 8px' }}>Miktar</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>G.TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 12, opacity: 0.8 }}>Satır eklenmedi</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Alt blok: Tutarlar + Açıklama/Ödeme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 0, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid' }}>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                <button type="button" style={{ padding: '10px 12px', border: 'none', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Tutarlar</button>
                <button type="button" style={{ padding: '10px 12px', border: 'none', background: 'transparent', color: 'white' }}>Müstahsil Ek Alan</button>
              </div>
              <div style={{ display: 'grid', gap: 0, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>İskonto</span><strong>0.00</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Ara Toplam</span><strong>{totals.net.toFixed(2)}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}><span>Kdv Tutar</span><strong>{totals.vat.toFixed(2)}</strong></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <span>Tevkifat Oranı</span>
                  <select style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                    <option>YOK</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span>G.Toplam</span><strong>{totals.total.toFixed(2)}</strong></div>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Açıklama</div>
                <textarea rows={4} placeholder="" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white', resize: 'vertical' }} />
              </div>
              {/* Üst etiket şeridi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Ödenen</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Depo Seçiniz</div>
                <div style={{ fontSize: 12, opacity: 0.9, textAlign: 'right' }}>Ödeme Şekli</div>
              </div>
              {/* Girişler satırı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
                <input defaultValue="0.00" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option>Merkez</option>
                </select>
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option>Nakit</option>
                  <option>Havale</option>
                  <option>Kredi Kartı</option>
                </select>
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
                  <button type="button" onClick={() => router.push('/accounts?selectFor=dispatch')} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white' }}>Vazgeç</button>
                  <button type="button" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', color: 'white' }}>Kaydet</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sevk Bilgileri Modal */}
      {showShipmentInfo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 1200 }} onClick={() => setShowShipmentInfo(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 900, maxWidth: '95%', background: '#ffffff', color: '#111827', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: 14, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Sevk Bilgileri</div>
            <div style={{ padding: 14 }}>
              <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>
                Taşıyıcı Firma Bilgileri VEYA Plaka Bilgisi, Şoför Bilgisi, Taşıma Üniteleri alanlarını doldurmanız gerekmektedir.
              </div>

              {/* Üst iki kolon */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>Teslim Eden Bilgileri</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Ad Soyad</div><input value={delivererName} onChange={(e) => setDelivererName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Telefon</div><input value={delivererPhone} onChange={(e) => setDelivererPhone(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Fax</div><input value={delivererFax} onChange={(e) => setDelivererFax(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>E-Mail</div><input value={delivererEmail} onChange={(e) => setDelivererEmail(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                  </div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>Taşıyıcı Firma Bilgileri</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>VKN / TCKN</div><input value={carrierTaxId} onChange={(e) => setCarrierTaxId(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Adı</div><input value={carrierFirstName} onChange={(e) => setCarrierFirstName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Soyad</div><input value={carrierLastName} onChange={(e) => setCarrierLastName(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Ülke</div><input value={carrierCountry} onChange={(e) => setCarrierCountry(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Şehir</div><input value={carrierCity} onChange={(e) => setCarrierCity(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                    <div><div style={{ fontSize: 12, color: '#6b7280' }}>Mahalle / İlçe</div><input value={carrierDistrict} onChange={(e) => setCarrierDistrict(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
                  </div>
                </div>
              </div>

              {/* Plaka Bilgileri */}
              <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>Plaka Bilgileri</div>
                <div><div style={{ fontSize: 12, color: '#6b7280' }}>Plaka</div><input value={plateNo} onChange={(e) => setPlateNo(e.target.value)} style={{ width: '100%', maxWidth: 360, padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} /></div>
              </div>

              {/* Şoför Bilgileri */}
              <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Şoför Bilgileri</div>
                <div style={{ padding: 10 }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6', color: '#111827', textAlign: 'left' }}>
                          <th style={{ padding: 8, width: 160 }}>TCKN</th>
                          <th style={{ padding: 8 }}>Şoför Adı</th>
                          <th style={{ padding: 8 }}>Şoför Soyadı</th>
                          <th style={{ padding: 8, width: 80 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.map((d) => (
                          <tr key={d.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: 6 }}><input value={d.tckn} onChange={(e) => setDrivers((arr) => arr.map((x) => x.id === d.id ? { ...x, tckn: e.target.value } : x))} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} /></td>
                            <td style={{ padding: 6 }}><input value={d.firstName} onChange={(e) => setDrivers((arr) => arr.map((x) => x.id === d.id ? { ...x, firstName: e.target.value } : x))} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} /></td>
                            <td style={{ padding: 6 }}><input value={d.lastName} onChange={(e) => setDrivers((arr) => arr.map((x) => x.id === d.id ? { ...x, lastName: e.target.value } : x))} style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #d1d5db' }} /></td>
                            <td style={{ padding: 6, textAlign: 'right' }}><button type="button" onClick={() => setDrivers((arr) => arr.filter((x) => x.id !== d.id))} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: 'white' }}>Sil</button></td>
                          </tr>
                        ))}
                        {!drivers.length && (
                          <tr><td colSpan={4} style={{ padding: 8, color: '#6b7280' }}>Şoför eklenmedi</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="button" onClick={() => setDrivers((arr) => [...arr, { id: String(Date.now() + Math.random()), tckn: '', firstName: '', lastName: '' }])} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #22b8cf', background: '#22b8cf', color: 'white' }}>Ekle</button>
                  </div>
                </div>
              </div>

              {/* Taşıma Üniteleri */}
              <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: 10, borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>Taşıma Üniteleri</div>
                <div style={{ padding: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Dorse Plaka No</div>
                      <input value={units[0]?.trailerPlateNo ?? ''} onChange={(e) => setUnits([{ id: units[0]?.id ?? String(Date.now()), trailerPlateNo: e.target.value }])} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
                    </div>
                    <button type="button" onClick={() => setUnits((arr) => [...arr, { id: String(Date.now() + Math.random()), trailerPlateNo: '' }])} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #22b8cf', background: '#22b8cf', color: 'white' }}>Ekle</button>
                  </div>
                  {units.slice(1).map((u) => (
                    <div key={u.id} style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                      <input value={u.trailerPlateNo} onChange={(e) => setUnits((arr) => arr.map((x) => x.id === u.id ? { ...x, trailerPlateNo: e.target.value } : x))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
                      <button type="button" onClick={() => setUnits((arr) => arr.filter((x) => x.id !== u.id))} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: 'white' }}>Sil</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt butonlar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12 }}>
                <button type="button" onClick={() => { setDelivererName(''); setDelivererPhone(''); setDelivererFax(''); setDelivererEmail(''); setCarrierTaxId(''); setCarrierFirstName(''); setCarrierLastName(''); setCarrierCountry(''); setCarrierCity(''); setCarrierDistrict(''); setPlateNo(''); setDrivers([]); setUnits([]); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>Temizle</button>
                <button type="button" onClick={() => setShowShipmentInfo(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>İptal</button>
                <button type="button" onClick={() => setShowShipmentInfo(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


