import Image from 'next/image';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)' }}>
      <div style={{ width: 560, maxWidth: '90%', padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Image src="/finova_logo.png" alt="Finova" width={40} height={40} />
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Finova</h1>
        </div>
        <p style={{ marginTop: 0, opacity: 0.9 }}>Ön muhasebe uygulaması için başlangıç iskeleti hazır. Supabase bağlantısını .env.local ile yapılandırın ve Vercel’e dağıtın.</p>
      </div>
    </main>
  );
}


