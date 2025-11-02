# Finova

On muhasebe uygulamasi — React (Next.js) + Supabase iskeleti.

## Kurulum (Gelistirme)
1. Node 18+ kurulu olsun.
2. Bagimliliklari yukleyin:

```bash
npm install
```

3. Ortam degiskenlerini ayarlayin (lokalde `.env.local`):
   - NEXT_PUBLIC_SUPABASE_URL = https://xohlkybfbutgyixsjjen.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key>

4. Logoyu kopyalayin: public/finova_logo.png

5. Gelistirme sunucusunu baslatin:

```bash
npm run dev
```

## GitHub’a gonderme
Hedef repo: [msenses/finova2](https://github.com/msenses/finova2.git)

```bash
git init
git branch -M master
git add .
git commit -m "feat: bootstrap Finova (Next.js + Supabase)"
git remote add origin https://github.com/msenses/finova2.git
git push -u origin master
```

## Vercel Dagitimi
1. Vercel hesabinizda "New Project" -> "Import Git Repository" -> msenses/finova2'yi secin.
2. Framework: Next.js (otomatik algilanir), Build Command: `next build`, Output: `.next` (varsayilanlar).
3. Environment Variables (Production, Preview, Development ortamlarina ekleyin):
   - NEXT_PUBLIC_SUPABASE_URL = https://xohlkybfbutgyixsjjen.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key>
4. Deploy deyin; ilk dagitimdan sonra alan adini ayarlayin.

Notlar:
- Supabase service role anahtarina frontend’de ihtiyac yoktur. Sadece NEXT_PUBLIC_* anahtarlari kullanilir.
- Logo eksikse ana sayfadaki gorsel bos gorunebilir; public/finova_logo.png ekleyin.

## Proje Yapisi
- src/app — Next.js App Router sayfalari
- src/lib/supabaseClient.ts — Supabase istemcisi
- public/ — statik dosyalar (logo vs.)

## PRD
Ayritili kapsam ve yol haritasi icin docs/PRD.md dosyasina bakin.


