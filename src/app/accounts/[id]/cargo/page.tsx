'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Route } from 'next';

type Account = {
  id: string;
  name: string;
  code: string | null;
  group?: string | null;
  contact?: string | null;
  phone: string | null;
  email: string | null;
  address?: string | null;
};

export default function CargoSlipPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const accountId = params?.id;
  const [acc, setAcc] = useState<Account | null>(null);
  const [printing, setPrinting] = useState(false);

  // form states
  const [group, setGroup] = useState('MÜŞTERİLER');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const [tel, setTel] = useState('');
  const [fax, setFax] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [web, setWeb] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxId, setTaxId] = useState('');
  const [tradeReg, setTradeReg] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [invoiceAddr, setInvoiceAddr] = useState('');
  const [shippingAddr, setShippingAddr] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      const { data: a } = await supabase.from('accounts').select('id, name, code, phone, email, address').eq('id', accountId).single();
      const accData = (a ?? null) as any as Account | null;
      setAcc(accData);
      setName(accData?.name ?? '');
      setEmail(accData?.email ?? '');
      setTel(accData?.phone ?? '');
      setInvoiceAddr(accData?.address ?? '');
      setShippingAddr(accData?.address ?? '');
    };
    if (accountId) load();
  }, [accountId, router]);

  const handlePrint = () => {
    setPrinting(true);
    // Küçük gecikme ile UI'yı güncelle
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 50);
  };

  return (
    <main style={{ minHeight: '100dvh', color: 'white' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-wrapper {
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .print-box { border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
          .print-section-title { writing-mode: vertical-rl; transform: rotate(180deg); font-weight: 700; font-size: 12px; color: #000; }
        }
      `}</style>
      <div style={{ padding: 16 }}>
        {/* Toolbar */}
        <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handlePrint} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>🧾 Kargo Fişi</button>
          <button onClick={() => router.push((`/accounts/${accountId}`) as Route)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer' }}>Geri</button>
        </div>

        {/* Ekran formu */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          {/* Cari Bilgileri */}
          <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Cari Bilgileri</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Grup :</div>
                <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }}>
                  <option>MÜŞTERİLER</option>
                  <option>TEDARİKÇİLER</option>
                  <option>DİĞER</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Hesap/Firma Adı:</div>
                <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Yetkili:</div>
                <input value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} />
              </div>
            </div>
          </section>

          {/* İletişim Bilgileri */}
          <section style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>İletişim Bilgileri</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Telefon:</div><input value={tel} onChange={(e) => setTel(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Fax:</div><input value={fax} onChange={(e) => setFax(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Cep Telefonu:</div><input value={mobile} onChange={(e) => setMobile(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>E-mail:</div><input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Web Adresi:</div><input value={web} onChange={(e) => setWeb(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Posta Kodu:</div><input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Vergi Dairesi:</div><input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Vergi No:</div><input value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Ticaret Sicil No:</div><input value={tradeReg} onChange={(e) => setTradeReg(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>İl:</div><input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>İlçe:</div><input value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Fatura Adresi:</div><input value={invoiceAddr} onChange={(e) => setInvoiceAddr(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
              <div><div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Sevk Adresi:</div><input value={shippingAddr} onChange={(e) => setShippingAddr(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.15)', color: 'white' }} /></div>
            </div>
          </section>
        </div>

        {/* Yazdırılabilir görünüm */}
        <div className="print-wrapper" style={{ marginTop: 24, background: printing ? '#fff' : 'transparent', color: printing ? '#000' : 'inherit' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 12, alignItems: 'start', maxWidth: 720 }}>
            {/* GÖNDEREN */}
            <div className="print-section-title">GÖNDEREN</div>
            <div className="print-box">
              <div style={{ fontSize: 12, fontWeight: 700 }}>ADI SOYADI: {acc?.name ? 'TEST BILSOFT' : 'TEST BILSOFT'}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>ADRES :</div>
              <div style={{ fontSize: 12 }}>TEL : {tel}{mobile ? ' / ' + mobile : ''}</div>
              <div style={{ fontSize: 12 }}>Vergi Dairesi/Vergi No : {taxOffice || '-'} / {taxId || '-'}</div>
            </div>

            {/* ALICI */}
            <div className="print-section-title" style={{ marginTop: 16 }}>ALICI</div>
            <div className="print-box" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>ADI SOYADI: {name || acc?.name || '-'}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>ADRES : {invoiceAddr || '-'}</div>
              <div style={{ fontSize: 12 }}>TEL : {tel}{mobile ? ' / ' + mobile : ''}</div>
              <div style={{ fontSize: 12 }}>Vergi Dairesi/Vergi No : {taxOffice || '-'} / {taxId || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


