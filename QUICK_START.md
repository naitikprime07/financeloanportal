# 🚀 Quick Start - Local Testing

## 🎯 Fastest Way to Test

### Option 1: Double-click Batch Files (Windows)

**Test Hindi Site Only:**
```
📁 start-hindi.bat
```
Opens: http://localhost:5173 (Hindi blogs)

**Test English Site Only:**
```
📁 start-english.bat
```
Opens: http://localhost:5174 (English blogs)

**Test Both Sites Simultaneously:**
```
📁 start-both.bat
```
Opens BOTH:
- http://localhost:5173 (Hindi)
- http://localhost:5174 (English)

---

## 🖥️ Command Line

### Start Hindi Site (Port 5173)
```bash
npm run dev
```
Visit: http://localhost:5173

### Start English Site (Port 5174)
```bash
npm run dev -- --port 5174
```
Visit: http://localhost:5174

---

## ✅ What to Test

### Hindi Domain (localhost:5173)

| Test | Expected |
|------|----------|
| Home page | Shows ONLY Hindi blogs |
| Language button | Shows "हिंदी" |
| `/blog/personal-loan-online-eligibility-check-apply` | Hindi Personal Loan blog |
| `/blog/aadhaarpe-loan-online-eligibility-check-apply` | Hindi AadhaarPe blog |
| Refresh page | Stays on Hindi site |

### English Domain (localhost:5174)

| Test | Expected |
|------|----------|
| Home page | Shows ONLY English blogs |
| Language button | Shows "English" |
| `/blog/personal-loan-online-check-eligibility-apply` | English Personal Loan blog |
| `/blog/aadhaarpe-loan-online-check-eligibility-apply` | English AadhaarPe blog |
| Refresh page | Stays on English site |

---

## 🔧 Environment File

Your `.env` should have:

```bash
VITE_MAIN_DOMAIN=http://localhost:5173
VITE_ENGLISH_DOMAIN=http://localhost:5174
VITE_DEFAULT_LANGUAGE=hi
```

✅ Already configured - no changes needed!

---

## 📱 Mobile Testing

Start with host flag to test on phone:

```bash
npm run dev -- --host
```

Then access from phone using your PC's IP:
- Hindi: http://192.168.x.x:5173
- English: http://192.168.x.x:5174

---

## 🐛 Troubleshooting

### Port already in use?

Change port:
```bash
npm run dev -- --port 3000
```

Update `.env`:
```bash
VITE_MAIN_DOMAIN=http://localhost:3000
```

### No blogs showing?

1. Restart server
2. Clear browser cache (Ctrl+Shift+Del)
3. Check browser console (F12)

### Both domains show same content?

1. Make sure you're on correct port (5173 vs 5174)
2. Check URL bar
3. Hard refresh (Ctrl+Shift+R)

---

## 📚 Full Documentation

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for complete details.

---

## 🎬 Quick Demo

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run dev -- --port 5174
```

**Browser:**
1. Open http://localhost:5173 → See Hindi blogs 🇮🇳
2. Open http://localhost:5174 → See English blogs 🇬🇧
3. Compare the home pages side-by-side!

---

## ✨ That's It!

Your site is now domain-aware. When deployed:
- `automatedsalesplatform.com` → Hindi blogs
- `en.automatedsalesplatform.com` → English blogs

Just update `.env` for production deployment!
