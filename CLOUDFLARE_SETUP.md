# Setup Cloudflare Workers (Gratis)

## Langkah-langkah Setup:

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login ke Cloudflare
```bash
wrangler login
```
- Akan membuka browser untuk login
- Login dengan akun Cloudflare (gratis)

### 3. Set Environment Variables (API Keys)
```bash
# Set Groq API Key
wrangler secret put GROQ_API_KEY
# Masukkan API key Groq kamu saat diminta

# Optional: Set OpenAI API Key (jika mau pakai OpenAI juga)
wrangler secret put OPENAI_API_KEY
# Masukkan API key OpenAI kamu saat diminta
```

### 4. Deploy Worker
```bash
npm run deploy:worker
```

### 5. Dapatkan URL Worker
- Setelah deploy, akan muncul URL seperti: `https://web-ai-proxy.YOUR_SUBDOMAIN.workers.dev`
- Copy URL ini

### 6. Update GitHub Secret
1. Buka GitHub → Repository → Settings → Secrets and variables → Actions
2. Edit secret `VITE_PROXY_URL`
3. Ganti value dengan URL Cloudflare Workers kamu (contoh: `https://web-ai-proxy.YOUR_SUBDOMAIN.workers.dev`)
4. Save

### 7. Trigger Rebuild GitHub Pages
1. Buka GitHub → Repository → tab "Actions"
2. Pilih workflow "Deploy to GitHub Pages"
3. Klik "Run workflow" → pilih branch `master` → Run workflow

### 8. Selesai!
- Setelah deployment selesai, buka `https://velixvalhinsen.github.io/WEBAI/`
- User bisa langsung chat tanpa perlu masukkan API key!

## Catatan:
- Cloudflare Workers **GRATIS** dengan limit 100,000 requests/hari
- API key disimpan aman di Cloudflare (tidak terlihat di code)
- User tidak perlu masukkan API key, langsung bisa chat seperti ChatGPT

