# Local Development Setup - Domain/Language Testing

## Prerequisites
- Node.js installed
- npm installed
- Project dependencies installed (`npm install`)

## Environment Configuration

Your `.env` file should have:

```bash
# Domain and Language Configuration
VITE_MAIN_DOMAIN=http://localhost:5173
VITE_ENGLISH_DOMAIN=http://localhost:5174
VITE_DEFAULT_LANGUAGE=hi
```

## Running the Application

### Option 1: Single Port (Default Hindi Site)

**Start the development server:**

```bash
npm run dev
```

This will start the server on `http://localhost:5173` (default Vite port).

**Expected Behavior:**
- ✅ Shows **ONLY Hindi blogs**
- ✅ Language button shows: **हिंदी**
- ✅ All Hindi blog content (Personal Loan, AadhaarPe, etc.)
- ✅ No English blogs visible

**Test URLs:**
- Home: http://localhost:5173/
- Hindi Blog: http://localhost:5173/blog/personal-loan-online-eligibility-check-apply
- Category: http://localhost:5173/category/customer-management

### Option 2: Dual Port Setup (Hindi + English Sites)

To test both language sites simultaneously, you need to run TWO separate instances:

#### Terminal 1 - Hindi Site (Port 5173)

```bash
npm run dev
```

Access at: http://localhost:5173

#### Terminal 2 - English Site (Port 5174)

```bash
npm run dev -- --port 5174
```

Access at: http://localhost:5174

### Option 3: Modify Vite Config for Multi-Port (Recommended)

Update `vite.config.js` to make port configuration easier:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: process.env.VITE_PORT || 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
```

Then run:

**Hindi Site:**
```bash
npm run dev
```

**English Site (separate terminal):**
```bash
VITE_PORT=5174 npm run dev
```

## Testing Checklist

### ✅ Hindi Domain (localhost:5173)

**Blog Listing:**
- [ ] Home page shows ONLY Hindi blogs
- [ ] No English blogs appear
- [ ] Language button shows "हिंदी"
- [ ] Blog titles in Hindi/Devanagari script

**Direct Blog URLs:**
- [ ] `/blog/personal-loan-online-eligibility-check-apply` - Hindi Personal Loan works
- [ ] `/blog/aadhaarpe-loan-online-eligibility-check-apply` - Hindi AadhaarPe works
- [ ] `/blog/car-loan-check-offers-apply-online` - Hindi Car Loan works

**Category Pages:**
- [ ] Categories show only Hindi blogs
- [ ] No English blogs in categories

**Ads:**
- [ ] Top ad loads correctly
- [ ] Middle ads (MIDDLE_1, MIDDLE_2, MIDDLE_3) display
- [ ] Rewarded ad button works
- [ ] No console errors

### ✅ English Domain (localhost:5174)

**Blog Listing:**
- [ ] Home page shows ONLY English blogs
- [ ] No Hindi blogs appear
- [ ] Language button shows "English"
- [ ] Blog titles in English

**Direct Blog URLs:**
- [ ] `/blog/personal-loan-online-check-eligibility-apply` - English Personal Loan works
- [ ] `/blog/aadhaarpe-loan-online-check-eligibility-apply` - English AadhaarPe works
- [ ] `/blog/car-loan-explore-financing-next-car` - English Car Loan works

**Category Pages:**
- [ ] Categories show only English blogs
- [ ] No Hindi blogs in categories

**Ads:**
- [ ] Top ad loads correctly
- [ ] Middle ads display correctly
- [ ] Rewarded ad button works
- [ ] No console errors

### ✅ Cross-Domain Behavior

- [ ] Refreshing Hindi blog stays on localhost:5173
- [ ] Refreshing English blog stays on localhost:5174
- [ ] No mixed language content
- [ ] Language button appears correctly on both domains

## Browser Console Tests

Open browser DevTools (F12) and check:

```javascript
// In Hindi domain (localhost:5173)
console.log(window.location.origin); // Should be: http://localhost:5173

// In English domain (localhost:5174)
console.log(window.location.origin); // Should be: http://localhost:5174
```

## Troubleshooting

### Issue: Both domains show same blogs

**Solution:**
- Make sure you're running on the correct port
- Clear browser cache
- Check that `VITE_MAIN_DOMAIN` and `VITE_ENGLISH_DOMAIN` are correctly set in `.env`
- Restart dev server after `.env` changes

### Issue: No blogs showing

**Check:**
```bash
# Verify environment variables are loaded
echo $VITE_MAIN_DOMAIN
echo $VITE_ENGLISH_DOMAIN
```

**In browser console:**
```javascript
console.log(import.meta.env.VITE_MAIN_DOMAIN);
console.log(import.meta.env.VITE_ENGLISH_DOMAIN);
```

### Issue: Language button not showing

- Check browser console for errors
- Verify LanguageToggle component is imported in BlogDetail.jsx
- Make sure `getCurrentSiteLanguage()` returns correct value

### Issue: Port 5173 or 5174 already in use

**Kill the process:**

Windows:
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

**Or use different ports:**
```bash
npm run dev -- --port 3000
npm run dev -- --port 3001
```

Then update `.env`:
```bash
VITE_MAIN_DOMAIN=http://localhost:3000
VITE_ENGLISH_DOMAIN=http://localhost:3001
```

## Quick Test Commands

**Start and auto-open Hindi site:**
```bash
npm run dev -- --open
```

**Start English site on port 5174:**
```bash
npm run dev -- --port 5174 --open
```

## Production Testing

To test production build locally:

```bash
# Build
npm run build

# Preview on default port
npm run preview

# Preview on specific port
npm run preview -- --port 5173
```

## Notes

- **Hot Module Replacement (HMR):** Works on both ports simultaneously
- **Environment Variables:** Changes require server restart
- **Browser Testing:** Test in Chrome/Firefox/Edge for best results
- **Mobile Testing:** Use `--host` flag to test on mobile devices:
  ```bash
  npm run dev -- --host
  ```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify `.env` file has correct values
3. Restart dev server
4. Clear browser cache
5. Check this guide's troubleshooting section
