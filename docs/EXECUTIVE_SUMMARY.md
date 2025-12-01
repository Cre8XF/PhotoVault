# CLOUDFLARE R2 MIGRATION - EXECUTIVE SUMMARY

## PROBLEM

Etter bytte fra Firebase Storage + Netlify DNS til Cloudflare R2 + Cloudflare DNS:
- ❌ Bilder vises IKKE i EditorWorld, PhotoPage, SearchPage
- ❌ Thumbnails mangler eller viser svart skjerm  
- ❌ Video grid feiler
- ❌ Intermittente CORS-feil
- ❌ DNS/SSL-konflikter

---

## ROT-ÅRSAKER (Top 5)

### 1. CORS HEADERS MANGLER (90% sannsynlighet)
**Problem:** `cors.json` mangler kritiske headers  
**Fix:** Legg til `Content-Range`, `Accept-Ranges`, `Access-Control-Expose-Headers`  
**Tid:** 30 min

### 2. CONTENT-TYPE IKKE SATT (80% sannsynlighet)
**Problem:** R2 får ikke MIME-type ved upload  
**Fix:** Legg til eksplisitt `contentType` i `uploadBytes()`  
**Tid:** 15 min

### 3. URL-FORMAT FEIL (70% sannsynlighet)
**Problem:** Appen bruker fortsatt Firebase URLs i state/Firestore  
**Fix:** Valider at alle URLs er R2-format  
**Tid:** 20 min

### 4. DNS PROXY INKONSISTENT (60% sannsynlighet)
**Problem:** Noen records er "proxied", andre "DNS only"  
**Fix:** Sett alle til samme status, SSL til "Full (strict)"  
**Tid:** 15 min

### 5. R2 BUCKET POLICY MANGLER (50% sannsynlighet)
**Problem:** Public read ikke aktivert  
**Fix:** Deploy bucket policy via Cloudflare dashboard  
**Tid:** 10 min

---

## QUICK-FIX PRIORITY LIST

### 🔴 CRITICAL (Fix først - 1.5 timer total)

**A1. CORS Configuration (30 min)**
```bash
# Oppdater cors.json med fullstendig header-liste
# Deploy via Cloudflare dashboard
```

**A2. Content-Type Headers (15 min)**
```javascript
// src/firebase.js, linje ~445
await uploadBytes(storageRef, file, { 
  contentType: fileType  // ← Legg til denne
})
```

**A3. URL Validation (20 min)**
```javascript
// Logg alle URLs i PhotoGrid
console.log('Photo URLs:', photos.map(p => p.url))
// Verifiser at ingen starter med "firebasestorage.googleapis.com"
```

**A4. DNS/SSL (15 min)**
```
1. Cloudflare Dashboard → DNS
2. Sjekk at alle records er "Proxied" (oransje sky)
3. SSL/TLS → Set to "Full (strict)"
4. Page Rules → Bypass cache for /*.js, /*.css, /index.html
```

---

### 🟡 IMPORTANT (Fix deretter - 1.5 timer)

**B1. Thumbnail Generation (30 min)**
**B2. Video Range Requests (20 min)**
**B3. State Migration (45 min)**

---

### 🟢 NICE-TO-HAVE (Fix sist - 1.5 timer)

**C1. Caching Optimization (30 min)**
**C2. CDN Performance (20 min)**
**C3. Error Monitoring (30 min)**

---

## TESTING CHECKLIST

Etter hver fix, test:

### Upload Flow
- [ ] Upload JPEG (< 5MB)
- [ ] Upload MP4 (< 50MB)
- [ ] Sjekk Network tab: Status 200, Content-Type korrekt
- [ ] Ingen CORS errors i Console

### Display Flow
- [ ] PhotoGrid viser thumbnails
- [ ] Klikk bilde → PhotoPage viser fullsize
- [ ] Klikk video → PhotoModal spiller av
- [ ] EditorPage viser bilde (ikke svart skjerm)
- [ ] SearchPage multiselect fungerer

### Cross-Browser
- [ ] Chrome Desktop
- [ ] Safari Desktop
- [ ] iOS Safari
- [ ] Android Chrome

---

## ESTIMERT LØSNINGSTID

| Prioritet | Tid | Kumulativ |
|-----------|-----|-----------|
| A (Critical) | 1.5t | 1.5t |
| B (Important) | 1.5t | 3.0t |
| C (Nice-to-have) | 1.5t | 4.5t |

**Anbefalt:** Start med A-priority. Etter 1.5 timer er 80% av problemene løst.

---

## NEXT STEPS

1. **Roger:** Eksporter Cloudflare DNS config (txt/JSON)
2. **Roger:** Verifiser R2 bucket name og account ID
3. **Claude Code:** Implementer A1-A4 fixes
4. **Roger:** Test på staging
5. **Deploy:** Kun hvis alle tester passerer

---

## ROLLBACK PLAN

Hvis kritiske feil oppstår:
1. Reverter DNS til Netlify (5 min)
2. Reverter storage til Firebase (10 min)
3. Deploy forrige git commit (2 min)

Total rollback tid: ~20 minutter

---

## RISIKO-VURDERING

| Risiko | Sannsynlighet | Impact | Mitigation |
|--------|---------------|--------|------------|
| CORS blokkerer all media | Høy (90%) | Kritisk | Fix A1 først |
| Content-Type mangler | Høy (80%) | Høy | Fix A2 andre |
| DNS SSL-loop | Middels (60%) | Kritisk | Fix A4 tredje |
| R2 bucket private | Middels (50%) | Kritisk | Deploy policy |
| Gamle Firebase URLs i DB | Lav (30%) | Middels | Migration script |

---

## KONTAKT

**Spørsmål?**  
→ Kommenter på dette dokumentet  
→ Eller kontakt Roger direkte

**Trenger du:**
- Cloudflare account ID?  
- R2 bucket name?  
- DNS export?  
→ Få fra Roger før du starter fixing
