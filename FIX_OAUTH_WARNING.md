# Fix OAuth Warning di Firebase

Error yang muncul:
```
The current domain is not authorized for OAuth operations. 
Add your domain (gimnas11.github.io) to the OAuth redirect domains list
```

## Solusi:

### Langkah 1: Tambahkan Domain ke Authorized Domains

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Firebase Anda
3. Klik **Authentication** di sidebar
4. Klik tab **Settings**
5. Scroll ke bagian **Authorized domains**
6. Klik **Add domain**
7. Masukkan: `gimnas11.github.io`
8. Klik **Add**

### Catatan Penting:

⚠️ **Warning ini TIDAK mempengaruhi Email/Password authentication!**

- Warning ini hanya untuk OAuth operations (Google Sign-In, Facebook, dll)
- Login/Register dengan Email/Password tetap berfungsi normal
- Jika tidak pakai OAuth, warning ini bisa diabaikan

### Jika Ingin Menghilangkan Warning:

Tambahkan domain `gimnas11.github.io` ke Authorized domains seperti langkah di atas.

### Verifikasi:

Setelah menambahkan domain, refresh website dan cek console - warning seharusnya hilang.

