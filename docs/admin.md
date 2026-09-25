# Finora — Avatar Upload & System Admin Implementation

Implementasikan dua fitur berikut pada aplikasi **Finora** yang sudah berjalan:

1. **Profile Avatar Upload**
2. **System Admin Role & Admin Panel**

## 1. Aturan Utama

* Jangan rebuild atau mengganti arsitektur Finora yang sudah ada.
* Pertahankan stack dan struktur existing:

  * Next.js App Router + TypeScript
  * Laravel REST API
  * Supabase Auth
  * Supabase PostgreSQL
  * Supabase Storage
  * Nginx
* Ikuti pola API, authentication, authorization, component, query management, styling, dan folder structure yang sudah digunakan project.
* Jangan membuat sistem authentication baru.
* Jangan membuat sistem database atau storage baru di luar yang diperlukan.
* Jangan mengubah fitur keuangan yang sudah berjalan.
* Semua perubahan harus backward-compatible dengan data user yang sudah ada.
* Prioritaskan security, consistency, responsive UI, error handling, dan tidak menimbulkan regression.

---

# 2. Profile Avatar Upload

## A. Supabase Storage

Buat bucket:

```text
avatars
```

Avatar di-upload **langsung dari Next.js ke Supabase Storage**, bukan melalui Laravel.

Implementasikan Storage RLS sehingga:

* User hanya dapat meng-upload avatar miliknya sendiri.
* User hanya dapat meng-update/re-upload avatar miliknya sendiri.
* User hanya dapat menghapus avatar miliknya sendiri.
* User tidak dapat mengubah atau menghapus avatar user lain.
* Jangan menggunakan Supabase `service_role` key di browser.
* Gunakan session/authenticated client yang aman.

Gunakan struktur path yang konsisten, misalnya:

```text
avatars/{user_id}/avatar.{extension}
```

Jangan menggunakan nama file random tanpa struktur ownership yang jelas.

Validasi upload:

* Hanya image yang diperbolehkan.
* Batasi ukuran file.
* Validasi MIME type dan extension.
* Tolak file yang tidak valid.
* Kompres/resize di client jika memungkinkan.
* Jangan menyebabkan browser mengirim file berukuran besar tanpa kebutuhan.

Jika user mengganti avatar:

* Pastikan avatar baru berhasil di-upload sebelum URL profil diperbarui.
* Jangan menghapus avatar lama sebelum upload baru berhasil.
* Setelah avatar baru tersimpan dengan benar, avatar lama boleh dihapus jika aman.
* Jangan sampai profil kehilangan avatar karena proses upload/delete gagal di tengah jalan.

---

# 3. Database Avatar

Tambahkan migration Laravel untuk:

```text
users.avatar_url
```

Dengan ketentuan:

* nullable
* tidak mengganggu user existing
* migration aman dijalankan pada database existing
* tidak menghapus data user

Update model/user serialization agar `avatar_url` dapat digunakan.

Update:

```text
GET /api/v1/auth/me
PUT /api/v1/auth/profile
```

Agar `avatar_url` tersedia dan dapat diperbarui.

Backend tetap melakukan authorization berdasarkan authenticated user.

Jangan menerima:

```text
user_id
```

dari frontend untuk menentukan profil mana yang akan diubah.

User target harus selalu berasal dari authenticated session/JWT.

---

# 4. Frontend Avatar

Buat/reuse component:

```text
AvatarUpload
```

di:

```text
Settings → Profile
```

Fitur:

* Preview avatar existing.
* Upload avatar baru.
* Loading state saat upload.
* Progress/feedback jika memungkinkan.
* Success state.
* Error state.
* Remove avatar jika fitur tersebut tersedia.
* Fallback ke inisial nama jika avatar tidak tersedia.
* Circular avatar.
* Responsive mobile/tablet/desktop.

Avatar juga harus otomatis diperbarui pada:

* Top Navigation
* Profile Card
* Profile Dropdown
* halaman/profile component lain yang menggunakan data user

Jangan sampai setelah upload berhasil user harus logout/login untuk melihat avatar baru.

Gunakan cache/query invalidation atau mekanisme refresh yang sudah digunakan Finora.

Pastikan tidak terjadi:

* avatar lama tetap muncul setelah upload berhasil
* avatar baru hanya muncul di Settings tetapi tidak di Navbar
* flickering berlebihan
* broken image tanpa fallback
* infinite loading
* duplicate upload request

Jika URL avatar invalid atau image gagal dimuat, fallback otomatis ke initial nama.

---

# 5. System Admin Role

Tambahkan role pada `users`:

```text
user
admin
```

Default:

```text
user
```

Gunakan pendekatan yang kompatibel dengan database existing.

Jika project sudah mempunyai mekanisme enum/status tertentu, ikuti pola existing daripada membuat implementasi yang bertabrakan.

---

# 6. Admin Seeder

Buat:

```text
AdminUserSeeder
```

untuk membuat 1 akun admin awal.

Contoh:

```text
admin@finora.com
```

Namun:

* Jangan hardcode password production secara permanen.
* Gunakan environment variable untuk credential admin jika memungkinkan.
* Jangan expose password admin ke frontend.
* Seeder harus idempotent.
* Menjalankan seeder berkali-kali tidak boleh membuat duplicate admin.
* Jangan mengubah role user existing secara tidak sengaja.

Contoh konfigurasi:

```env
ADMIN_EMAIL=admin@finora.com
ADMIN_PASSWORD=change-this-password
```

Setelah login pertama, admin sebaiknya dapat mengganti password melalui mekanisme authentication existing.

---

# 7. Backend Admin Security

Buat middleware:

```text
EnsureIsAdmin
```

Validasi:

1. User sudah authenticated.
2. User memiliki role `admin`.

Jika bukan admin:

```text
403 Forbidden
```

Jangan hanya mengandalkan frontend untuk security.

Buat route group:

```text
/api/v1/admin/*
```

yang dilindungi authentication + admin authorization.

Contoh:

```text
GET /api/v1/admin/stats
GET /api/v1/admin/users
```

Admin endpoint harus benar-benar melakukan authorization di Laravel.

User biasa tidak boleh mendapatkan data admin hanya dengan memanggil endpoint menggunakan Postman/cURL/browser.

Jangan pernah mempercayai:

```text
role
isAdmin
admin=true
```

yang dikirim dari frontend.

Role harus berasal dari authenticated user yang diverifikasi backend.

---

# 8. Admin Statistics

Buat endpoint statistik sistem.

Minimal:

```text
Total Users
Total Households
Total Transactions
```

Gunakan data database sebenarnya.

Jangan menggunakan hardcoded value.

Jika data kosong:

```text
0
```

bukan:

```text
NaN
undefined
null
Infinity
```

Pastikan query efisien dan tidak melakukan query berulang yang tidak diperlukan.

Jika memungkinkan gunakan aggregate query:

```text
COUNT
```

daripada mengambil seluruh record hanya untuk menghitung jumlah.

---

# 9. Admin User Management

Buat:

```text
GET /api/v1/admin/users
```

Menampilkan minimal:

* User name
* Email
* Avatar
* Role
* Registration date
* Household
* Status jika tersedia

Gunakan pagination dari backend.

Jangan mengambil seluruh user sekaligus jika jumlah data besar.

Tambahkan:

* Search
* Pagination
* Loading state
* Empty state
* Error state

Pastikan total pagination berasal dari backend dan akurat.

Jika search/filter berubah:

* reset page jika diperlukan
* update total
* update displayed data
* jangan menampilkan total dari query sebelumnya

---

# 10. Admin User Action

Untuk MVP, action berikut bersifat optional:

* Disable user
* Delete user

Jika diimplementasikan:

* Harus memiliki endpoint backend khusus.
* Hanya admin yang dapat menjalankannya.
* Gunakan confirmation dialog.
* Jangan langsung melakukan destructive action tanpa konfirmasi.
* Jangan menghapus user hanya dari frontend.
* Handle API failure dengan benar.
* Refresh/invalidate user list setelah action berhasil.

Hindari hard delete jika dapat menyebabkan foreign key/data household/transaction menjadi rusak.

Jika sistem belum memiliki mekanisme soft delete/status user yang aman, lebih baik gunakan status:

```text
active
inactive
```

daripada menghapus record secara permanen.

---

# 11. Admin Frontend Protection

Buat admin route:

```text
/admin
/admin/users
```

Gunakan layout/route guard khusus admin.

Flow:

```text
Unauthenticated
→ Login

Authenticated + role=user
→ Redirect /dashboard

Authenticated + role=admin
→ Allow /admin
```

Namun frontend guard hanya untuk UX.

Security sebenarnya tetap berada di Laravel middleware.

Jangan hanya melakukan:

```typescript
if (role === "admin")
```

sebagai satu-satunya security mechanism.

Role harus berasal dari authenticated user/session yang valid.

---

# 12. Admin Dashboard UI

Buat:

```text
/app/admin/page.tsx
```

Berisi card statistik:

```text
Users
Households
Transactions
```

Gunakan design system Finora yang sudah ada.

UI harus:

* Responsive
* Mobile-friendly
* Tablet-friendly
* Desktop-friendly
* Tidak menyebabkan horizontal overflow
* Memiliki loading skeleton/state
* Memiliki empty/error state
* Tidak menampilkan NaN/undefined/null

Gunakan komponen existing jika tersedia.

Jangan membuat design system baru.

---

# 13. Admin User Management UI

Buat:

```text
/app/admin/users/page.tsx
```

Dengan:

* Search user
* User avatar
* Name
* Email
* Role
* Household
* Registration date
* Status
* Pagination

Desktop dapat menggunakan table.

Mobile harus memiliki layout responsive yang nyaman, misalnya card/list, tanpa memaksa table terlalu lebar.

Pastikan UI tidak menyebabkan:

```text
horizontal overflow
text clipping
button keluar layar
pagination rusak
avatar pecah
```

---

# 14. Admin Panel Menu

Pada Profile Dropdown:

Jika:

```text
role === admin
```

tampilkan:

```text
Admin Panel
```

Jika:

```text
role === user
```

jangan tampilkan menu tersebut.

Menu hanya shortcut UI.

Backend tetap melakukan authorization.

Jika user role berubah dari admin menjadi user, menu harus otomatis hilang setelah session/user data diperbarui.

---

# 15. Data & Cache Synchronization

Setelah perubahan profile:

```text
avatar upload
profile update
```

pastikan data user diperbarui di seluruh aplikasi.

Setelah admin action:

```text
user update
disable
delete
```

pastikan user list dan statistics diperbarui.

Gunakan mekanisme query invalidation/refetch yang sudah digunakan Finora.

Jangan membuat duplicate state untuk user profile jika tidak diperlukan.

Prioritaskan satu source of truth untuk authenticated user.

---

# 16. Error & Edge Case Handling

Pastikan tidak ada glitch pada kondisi:

* User belum memiliki avatar.
* Avatar URL kosong.
* Avatar URL invalid.
* Upload gagal.
* Upload timeout.
* Storage permission denied.
* User logout saat upload berlangsung.
* User mengganti avatar dua kali dengan cepat.
* Backend profile update gagal setelah storage upload berhasil.
* Admin membuka halaman tanpa role admin.
* User biasa mencoba mengakses `/admin`.
* User biasa memanggil `/api/v1/admin/*`.
* Admin list kosong.
* Tidak ada household.
* Banyak user.
* Search tidak menemukan user.
* Pagination berada di page terakhir lalu data dihapus.
* API timeout.
* API mengembalikan error.
* Session expired.
* Role tidak tersedia sementara saat initial loading.

Tidak boleh muncul pada UI:

```text
NaN
Infinity
undefined
null
[object Object]
```

Gunakan fallback yang sesuai:

```text
0
—
Loading
Error
```

sesuai konteks datanya.

---

# 17. Security Checklist

Pastikan:

* Tidak ada Supabase service role key di client.
* Admin authorization dilakukan Laravel.
* Frontend tidak dapat menentukan role sendiri.
* User biasa tidak dapat mengakses endpoint admin.
* User tidak dapat mengubah avatar user lain.
* User ID tidak dipercaya dari request body untuk profile update.
* Admin endpoint tidak membocorkan data sensitif yang tidak diperlukan.
* Credential admin tidak hardcoded di source code production.
* Storage policy mengikuti ownership user.
* Validation dilakukan backend dan frontend.
* Semua mutation menggunakan authenticated session.

---

# 18. Testing

Sebelum dianggap selesai, test minimal:

### Avatar

* Upload avatar valid.
* Upload file bukan image.
* Upload file terlalu besar.
* Replace avatar.
* Avatar gagal upload.
* Avatar gagal disimpan ke profile.
* Remove avatar jika tersedia.
* Avatar tampil di Navbar.
* Avatar tampil di Profile.
* Fallback initial berfungsi.

### Admin

Test dengan:

```text
User biasa
Admin
Unauthenticated
```

Pastikan:

```text
User → /admin → redirect /dashboard
User → /api/v1/admin/* → 403

Admin → /admin → allowed
Admin → /api/v1/admin/* → allowed

Unauthenticated → /admin → login
Unauthenticated → /api/v1/admin/* → 401
```

Test juga:

* Search
* Pagination
* Empty data
* API error
* Statistics
* Role display
* Responsive mobile
* Responsive desktop

---

# 19. Implementation Rules

Sebelum membuat perubahan:

1. Inspect struktur project terlebih dahulu.
2. Cari authentication flow existing.
3. Cari user model dan migration existing.
4. Cari API `/auth/me` dan profile endpoint.
5. Cari Supabase client existing.
6. Cari query/state management user existing.
7. Cari design system/component existing.
8. Cari middleware/route protection existing.

Kemudian implementasikan fitur dengan mengikuti pola existing.

Jangan membuat duplicate:

* Auth provider
* Supabase client
* API client
* User context
* Middleware
* UI component
* Query hook

Jika functionality yang dibutuhkan sudah tersedia, gunakan dan extend implementation tersebut.

---

# 20. Final Acceptance Criteria

Implementasi dianggap selesai jika:

* Avatar dapat di-upload langsung dari frontend ke Supabase Storage.
* Avatar URL tersimpan melalui Laravel API.
* Avatar tampil konsisten di seluruh UI.
* Avatar memiliki fallback initial.
* Storage tidak dapat digunakan untuk mengakses/mengubah avatar user lain.
* User existing tetap berjalan tanpa migration/data issue.
* Role `user/admin` berjalan.
* Admin dapat membuka Admin Panel.
* User biasa tidak dapat mengakses Admin Panel.
* Backend benar-benar memblokir endpoint admin untuk non-admin.
* Admin Dashboard menampilkan statistik database sebenarnya.
* Admin User Management memiliki search + pagination.
* UI responsive.
* Tidak ada NaN, Infinity, undefined, null, broken image, atau loading state yang macet.
* Tidak ada hardcoded production secret.
* Tidak ada duplicate authentication/authorization system.
* Tidak mengubah atau merusak fitur Finora yang sudah ada.
* Semua perubahan mengikuti architecture dan coding pattern existing.

Setelah implementasi selesai, berikan ringkasan:

1. File yang dibuat/diubah.
2. Migration yang ditambahkan.
3. Endpoint baru/diubah.
4. Storage policy yang dibuat.
5. Security implementation.
6. Test yang dilakukan.
7. Issue yang ditemukan dan cara penyelesaiannya.
8. Hal yang masih perlu dilakukan jika ada.
