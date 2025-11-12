# G Chat - AI Programming Assistant

Aplikasi web modern berbasis AI untuk membantu tugas-tugas programming, dibangun dengan React, Vite, dan TailwindCSS. Aplikasi ini menyediakan asisten AI yang cerdas dengan dukungan OpenAI GPT-4o atau Groq Llama models.

## ✨ Fitur Utama

- 🤖 **Asisten AI Canggih**: Didukung oleh OpenAI GPT-4o atau Groq Llama models
- 💬 **Interface Chat**: UI yang indah dan responsif seperti ChatGPT
- 📝 **Riwayat Chat**: Buat, rename, hapus, dan kelola banyak percakapan
- ⚡ **Streaming Responses**: Respon AI real-time untuk alur percakapan yang natural
- 💻 **Code Highlighting**: Syntax highlighting otomatis untuk code blocks
- 📱 **Responsive Design**: Bekerja sempurna di desktop dan mobile
- 🌙 **Dark Mode**: Tema gelap modern yang nyaman untuk penggunaan lama
- 💾 **Local Storage**: Semua chat dan pengaturan disimpan lokal di browser
- 🔒 **Secure**: API key disimpan lokal, tidak pernah diekspos
- 📲 **PWA Support**: Dapat diinstall sebagai Progressive Web App

## 🚀 Cara Menggunakan

1. **Clone repository ini**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
4. **Buka browser:**
   Navigate ke `http://localhost:5173`
5. **Masukkan API Key:**
   - Saat pertama kali dibuka, Anda akan diminta memasukkan API key
   - API key disimpan lokal di browser Anda
   - Tidak pernah dibagikan atau dikirim ke server manapun

## 📦 Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist`, siap untuk di-deploy.

## 🌐 Deploy ke GitHub Pages

Repository ini sudah dilengkapi dengan GitHub Actions workflow yang otomatis deploy ke GitHub Pages setiap push ke branch `main`.

1. **Enable GitHub Pages:**
   - Pergi ke repository Settings → Pages
   - Pilih "GitHub Actions" sebagai source

2. **Set Environment Variable (jika menggunakan proxy):**
   - Pergi ke repository Settings → Secrets and variables → Actions
   - Tambahkan `VITE_PROXY_URL` secret dengan URL backend Anda

## 🛠️ Teknologi yang Digunakan

- [React](https://react.dev/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [OpenAI](https://openai.com/) - AI Model
- [Groq](https://groq.com/) - AI Model Alternative

## 📝 Catatan

Aplikasi ini memerlukan API key (dari user atau via backend proxy) dengan kredit yang cukup. Anda bertanggung jawab atas biaya penggunaan API.

---

**Dibuat dengan ❤️ oleh Gimnas Irwandi**
