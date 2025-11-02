# Finova — Ön Muhasebe Uygulaması — PRD v0.1

## 1) Amaç ve Kapsam
KOBİ ve mikro işletmelerin ön muhasebe ihtiyaçlarını (cari, fatura, stok, kasa/banka, temel raporlar) web tabanlı, ölçeklenebilir ve mevzuat uyumlu bir yapıda karşılamak. İlk sürüm, Bilsoft seviyesine yaklaşan bir MVP’yi hedefler; e-belge (e-Fatura/e-Arşiv/e-İrsaliye) entegrasyonları Faz 2+ olarak planlanır.

## 2) Hedef Kullanıcılar
- Ticarî işletmeler (küçük/orta ölçekte)
- Tek şube ve çok şube kullanımı
- Muhasebe elemanı olmayan kullanıcılar için sade akışlar

## 3) Modüller (Genel Liste)
- Cari Hesap Yönetimi (müşteri/tedarikçi, risk-limit, ekstrelER)
- Fatura & Belge (satış/alış, iade, teklif, sipariş, irsaliye)
- Stok & Depo (ürün, birim, KDV, iskonto, seri/lot, barkod, depo hareketleri)
- Kasa & Banka (tahsilat/ödeme, virman, POS, masraf fişi)
- Çek & Senet (Faz 2)
- E-Belgeler: e-Fatura, e-Arşiv, e-İrsaliye (Faz 2-3)
- Raporlama (cari ekstre, stok hareket, satış raporu, KDV, kâr-zarar)
- Kullanıcı & Yetkilendirme (rol tabanlı, firma/şube bazlı)
- Ayarlar (firma, döviz, KDV oranları, numaralandırma şemaları)

## 4) MVP Kapsamı (Faz 1)
- Cari: oluşturma/güncelleme, borç-alacak, tahsilat/ödeme kayıtları, ekstre
- Faturalama: satış/alış faturası (KDV, iskonto, çoklu kalem), PDF çıktısı
- Stok: ürün kartı, giriş/çıkış, basit depo, barkod alanı (okuma Faz 2)
- Kasa & Banka: basit tahsilat/ödeme, banka hareketi manuel giriş
- Raporlar: cari ekstre, satışlar (tarih/ürün/cari), stok hareket, KDV özet
- Kullanıcı & Rol: admin, operatör; çoklu firma (temel), çoklu şube (temel)
- Yedekleme: günlük otomatik veritabanı yedeği (Supabase) ve indirme

## 5) Faz 2+ (Öncelik Sırası Öneri)
1) E-Belgeler: e-Fatura/e-Arşiv (entegratör aracılığıyla)
2) E-İrsaliye, Çek & Senet
3) Barkodlu satış, hızlı satış/POS ekranı
4) Depo transfer, seri/lot, maliyet yöntemleri (FIFO/Ortalama)
5) Gelişmiş raporlar (BA/BS, bilanço/gelir tablosu entegrasyonları)

## 6) Temel İş Akışları (MVP)
- Fatura Oluştur: cari seç → stok kalemleri ekle → KDV/iskonto → kaydet → PDF
- Tahsilat/Ödeme: cari seç → kasa/banka → tutar → belge ilişkisi (opsiyonel)
- Stok Hareketi: fatura ile otomatik ya da manuel giriş/çıkış
- Raporlar: tarih aralığı ve filtrelerle özet/detay

## 7) Veri Modeli (Yüksek Seviye)
- users, roles, user_roles
- companies, branches (çoklu firma/şube)
- accounts (cariler), account_transactions
- products, product_units, stock_movements, warehouses (MVP tek depo)
- invoices (satış/alış), invoice_items
- cash_ledgers (kasa), bank_accounts, bank_transactions
- settings (numaralandırma, KDV varsayılanları, döviz), documents (PDF)

İlişkiler örn.: `invoices.company_id → companies.id`, `invoice_items.product_id → products.id`, `account_transactions.account_id → accounts.id`.

## 8) Teknoloji & Mimarî
- Frontend: React (Vite kullanmadan), modern masaüstü-öncelikli UI
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Kimlik Doğrulama: Supabase Auth (email/sifre, OTP opsiyonel)
- Dosyalar: Storage (PDF, logo)
- Dağıtım: Vercel/Netlify (FE) + Supabase (DB/Functions)

Notlar:
- Uygulama adı: Finova; logo: `public/finova_logo.png` (kaynak: `C:\Users\Asus\Desktop\projeler\muhasebe2\finova_logo_arkaplan_yok*`)
- Kullanıcı tercihleri: React tercih, Vite kullanılmasın; Supabase altyapısı; modern mavi-glass morphism tasarım; masaüstü-öncelikli düzen.

## 9) Güvenlik & Uyumluluk
- RBAC, satır-düzeyi güvenlik (RLS) — firma/şube bazlı erişim
- Şifrelenmiş iletim (HTTPS), denetim izi (critical tablolar için)
- Yedekleme: günlük, 7/30 gün saklama politikası
- E-belge: Faz 2’de GİB uyumu ve entegratör API’leri

## 10) Tasarım İlkeleri
- Masaüstü-öncelikli düzen, Inter font, net boşluklar, odak/hover haller
- Modern mavi palet, zarif cam kartlar, düşük yoğunluklu animasyonlar
- Logo yerleşimi: üst bar solda `aktif_logo.png`, tema ile uyum

## 11) Yol Haritası (Öneri)
- Hafta 1: Kurulum, Auth, çoklu firma/şube iskeleti, temel UI
- Hafta 2: Cari + Kasa/Banka + Raporlar (ekstre, satış özet)
- Hafta 3: Fatura (satış/alış) + PDF + stok entegrasyonu
- Hafta 4: Stok hareketleri, ürün, basit depo; kapanış ve sert testler
- Faz 2: e-Fatura/e-Arşiv, POS, depo transfer, gelişmiş raporlar

## 12) Başarı Kriterleri (MVP)
- 5000+ cari ve 100k+ fatura satırıyla kabul edilebilir performans
- Ana akışların tamamı 3 tık içinde erişilebilir
- Kritik raporların oluşturulması ≤ 3 sn (önbellek/özet tablolarla)

— PRD v0.1 —

