# Setup GitHub Secrets untuk Firebase

Panduan aman untuk menambahkan Firebase configuration ke GitHub Secrets.

## ⚠️ PENTING: Keamanan

- **JANGAN** hardcode API keys di source code
- **JANGAN** commit file `.env` ke Git
- **HANYA** gunakan GitHub Secrets untuk production

## Langkah-langkah:

### 1. Dapatkan Firebase Config

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Firebase Anda
3. Klik **⚙️ Settings** → **Project settings**
4. Scroll ke **"Your apps"** → Klik ikon **Web** (`</>`)
5. Copy nilai dari config object yang muncul

### 2. Tambahkan GitHub Secrets

1. Buka repository di GitHub: `https://github.com/gimnas11/WEBAI`
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **"New repository secret"**
4. Tambahkan **6 secrets** berikut (ganti dengan nilai dari Firebase Console Anda):

   | Name | Value (dari Firebase Console) |
   |------|-------------------------------|
   | `VITE_FIREBASE_API_KEY` | `apiKey` dari firebaseConfig |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` dari firebaseConfig |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` dari firebaseConfig |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` dari firebaseConfig |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` dari firebaseConfig |
   | `VITE_FIREBASE_APP_ID` | `appId` dari firebaseConfig |

### 3. Trigger Deployment

Setelah semua secrets ditambahkan:
1. Buka tab **Actions** di GitHub
2. Klik workflow **"Deploy to GitHub Pages"**
3. Klik **"Run workflow"** → **"Run workflow"**
4. Tunggu deployment selesai (2-5 menit)

### 4. Verifikasi

1. Buka website: `https://gimnas11.github.io/WEBAI/`
2. Hard refresh: `Ctrl + Shift + R`
3. Coba login - seharusnya berfungsi

## ✅ Keamanan GitHub Secrets

- Secrets hanya bisa dilihat oleh repository owner/collaborators
- Secrets **TIDAK** terlihat di public repository
- Secrets **TIDAK** terlihat di commit history
- Secrets hanya digunakan saat build di GitHub Actions

## 📝 Catatan

- Untuk development lokal, buat file `.env` (tidak di-commit)
- File `.env` sudah ada di `.gitignore`
- Jangan pernah share API keys di public

