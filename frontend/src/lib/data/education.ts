export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  readingTime: string;
  content: string;
  image?: string;
};

export const educationArticles: Article[] = [
  {
    id: '1',
    slug: 'cara-membuat-budget',
    title: 'Cara Membuat Budget Bulanan yang Efektif',
    summary: 'Pelajari dasar-dasar budgeting untuk mengontrol pengeluaran Anda setiap bulan.',
    category: 'Budgeting',
    readingTime: '5 min read',
    content: `
# Cara Membuat Budget Bulanan yang Efektif

Membuat anggaran (budget) bulanan adalah langkah pertama yang krusial menuju kebebasan finansial. Tanpa budget, sulit untuk melacak ke mana perginya uang Anda.

## 1. Catat Pemasukan Anda
Langkah pertama adalah mengetahui persis berapa banyak uang yang masuk setiap bulan. Jika penghasilan Anda berfluktuasi, gunakan rata-rata penghasilan terendah selama 6 bulan terakhir.

## 2. Lacak Pengeluaran
Gunakan aplikasi seperti Finora untuk mencatat setiap pengeluaran. Kategori yang umum meliputi:
- Kebutuhan pokok (Makanan, Sewa/Cicilan, Utilitas)
- Transportasi
- Tabungan & Investasi
- Hiburan

## 3. Terapkan Aturan 50/30/20
Metode yang populer adalah membagi pendapatan Anda ke dalam tiga kategori utama:
- **50% untuk Kebutuhan (Needs):** Biaya hidup dasar yang tidak bisa dihindari.
- **30% untuk Keinginan (Wants):** Hal-hal yang meningkatkan kualitas hidup tapi tidak esensial.
- **20% untuk Tabungan & Investasi:** Dana darurat, investasi jangka panjang, dan pembayaran utang.

## Kesimpulan
Budgeting bukanlah tentang membatasi diri Anda, melainkan tentang memberi tujuan pada setiap rupiah yang Anda hasilkan.
    `
  },
  {
    id: '2',
    slug: 'dana-darurat-pentingnya',
    title: 'Mengapa Anda Membutuhkan Dana Darurat?',
    summary: 'Dana darurat adalah fondasi keamanan finansial. Ketahui cara membangunnya.',
    category: 'Saving',
    readingTime: '4 min read',
    content: `
# Mengapa Anda Membutuhkan Dana Darurat?

Dana darurat adalah sejumlah uang yang disisihkan khusus untuk menghadapi pengeluaran tak terduga, seperti kehilangan pekerjaan, perbaikan rumah, atau masalah medis.

## Berapa Idealnya Dana Darurat?
Para perencana keuangan umumnya menyarankan:
- **Lajang / Belum memiliki tanggungan:** 3 hingga 6 bulan pengeluaran rutin.
- **Keluarga / Freelancer:** 6 hingga 12 bulan pengeluaran rutin.

## Cara Mengumpulkan Dana Darurat
1. **Mulai dari hal kecil:** Jika 6 bulan terasa terlalu berat, targetkan 1 bulan terlebih dahulu.
2. **Otomatisasi tabungan:** Sisihkan sekian persen di awal bulan sebelum uang terpakai.
3. **Simpan di tempat yang tepat:** Gunakan rekening yang mudah diakses tetapi terpisah dari rekening operasional harian.

Jangan gunakan dana ini untuk liburan atau diskon barang impian.
    `
  },
  {
    id: '3',
    slug: 'dasar-investasi-saham',
    title: 'Panduan Dasar Investasi Saham',
    summary: 'Memahami cara kerja pasar saham untuk pemula tanpa bahasa yang rumit.',
    category: 'Investment Basics',
    readingTime: '7 min read',
    content: `
# Panduan Dasar Investasi Saham

Berinvestasi di pasar saham bisa terasa menakutkan, tetapi sebenarnya ini adalah salah satu cara terbaik untuk membangun kekayaan jangka panjang.

## Apa itu Saham?
Membeli saham berarti Anda membeli sebagian kecil kepemilikan dari sebuah perusahaan. Jika perusahaan tumbuh dan mencetak laba, nilai saham Anda kemungkinan besar akan ikut naik.

## Prinsip Dasar Berinvestasi
1. **Mulai Sedini Mungkin:** Waktu adalah aset terbesar investor berkat efek *compounding* (bunga berbunga).
2. **Diversifikasi:** Jangan taruh semua telur dalam satu keranjang. Beli berbagai macam saham atau gunakan Reksadana/ETF.
3. **Jangan Panik:** Pasar saham akan naik dan turun. Hindari menjual saat panik.

Berinvestasilah secara rutin (Dollar Cost Averaging) daripada mencoba menebak waktu terbaik masuk ke pasar.
    `
  },
  {
    id: '4',
    slug: 'mengelola-keuangan-pasangan',
    title: 'Tips Mengelola Keuangan Bersama Pasangan',
    summary: 'Bagaimana cara menggabungkan dan mengelola uang secara transparan dengan pasangan Anda.',
    category: 'Household Finance',
    readingTime: '6 min read',
    content: `
# Tips Mengelola Keuangan Bersama Pasangan

Uang sering kali menjadi sumber konflik dalam hubungan. Mengelola secara transparan dan terbuka adalah kuncinya.

## Pendekatan yang Umum
1. **Semua Digabung (Yours, Mine, Ours):** Semua pemasukan masuk ke satu rekening, dan semua pengeluaran keluar dari rekening tersebut. Membutuhkan transparansi 100%.
2. **Sebagian Digabung:** Masing-masing menyetor jumlah tertentu (atau persentase penghasilan) ke rekening bersama untuk biaya hidup, sementara sisanya tetap dipegang masing-masing.
3. **Terpisah Sepenuhnya:** Masing-masing membayar tagihan yang sudah disepakati (misal, A bayar cicilan rumah, B bayar belanja bulanan).

## Komunikasi Rutin
Gunakan aplikasi seperti Finora untuk melacak kekayaan gabungan dan arus kas. Lakukan "Financial Date" bulanan untuk meninjau anggaran dan menyesuaikan target.
    `
  }
];
