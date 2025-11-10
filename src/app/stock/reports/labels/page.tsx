'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';

export default function StockLabelsReportPage() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.replace('/login');
    };
    init();
  }, [router]);

  return (
    <main style={{ minHeight: '100dvh', background: '#eef3f7', color: '#2c3e50' }}>
      <section style={{ padding: 12 }}>
        {/* Üst araç çubuğu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <button title="Kaydet" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>💾</button>
          <button title="Bul" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🔍</button>
          <button title="Yazdır" onClick={() => window.print()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>🖨</button>
          <button title="Yenile" onClick={() => router.refresh()} style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer' }}>↻</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button title="Önceki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: 'white', cursor: 'pointer', opacity: 0.5 }}>◀</button>
            <div style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #c8d1dc', background: 'white' }}>1 / 31</div>
            <button title="Sonraki" style={{ padding: 6, borderRadius: 6, border: '1px solid #c8d1dc', background: '#d32f2f', color: 'white', cursor: 'pointer' }}>▶</button>
          </div>
        </div>

        {/* Etiket sayfası */}
        <div style={{ background: 'white', border: '1px solid #dfe6ee', borderRadius: 6, minHeight: '70vh', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14, alignItems: 'start' }}>
            {/* Sola dikey barkod (örnek SVG) */}
            <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Barcode">
              {[5,10,14,18,22,26,30,34,38,42,46,50,54,58,62,66,70,74,78,82,86,90].map((x,i)=>(
                <rect key={i} x={x} y={10} width={i%3===0?3:2} height={100} fill="#000" />
              ))}
            </svg>

            {/* İçerik */}
            <div>
              <div style={{ fontSize: 12, color: '#7f8c8d' }}>11:08:22</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>İçim</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Peynir</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>12.50 ₺</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


