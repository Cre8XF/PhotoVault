# 🔥 Firebase Storage CORS Deployment Guide

**For:** Roger  
**Task:** Deploy CORS configuration to Firebase Storage bucket  
**Why:** Fix EditorPage canvas CORS errors  

---

## ✅ Prerequisites

You need **Google Cloud SDK** (gsutil) installed:

### macOS:
```bash
brew install google-cloud-sdk
```

### Windows:
Download from: https://cloud.google.com/sdk/docs/install

### Linux:
```bash
curl https://sdk.cloud.com | bash
exec -l $SHELL
```

---

## 🚀 Step 1: Login to Google Cloud

```bash
gcloud auth login
```

This will open your browser. Login with your Firebase/Google account.

---

## 🪣 Step 2: Find Your Firebase Storage Bucket Name

**Option A:** Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: **PhotoVault** (or your project name)
3. Click **Storage** in left menu
4. Copy the bucket name from the URL (format: `gs://PROJECT-ID.appspot.com`)

**Option B:** Command line
```bash
gcloud config set project YOUR-FIREBASE-PROJECT-ID
gsutil ls
```

**Expected output:**
```
gs://photovault-xxxxx.appspot.com/
```

---

## 📝 Step 3: Deploy CORS Configuration

We have a ready-made `cors.json` file in the project root.

**Deploy it:**

```bash
# Replace YOUR-BUCKET with your actual bucket name
gsutil cors set cors.json gs://YOUR-BUCKET.appspot.com
```

**Example:**
```bash
gsutil cors set cors.json gs://photovault-12345.appspot.com
```

**Expected output:**
```
Setting CORS on gs://photovault-12345.appspot.com/...
```

---

## ✅ Step 4: Verify CORS is Deployed

```bash
gsutil cors get gs://YOUR-BUCKET.appspot.com
```

**Expected output:**
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://pixtr.cloud",
      "https://www.pixtr.cloud"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Authorization",
      "Content-Type",
      ...
    ],
    "maxAgeSeconds": 3600
  }
]
```

---

## 🧪 Step 5: Test EditorPage

1. Open https://pixtr.cloud (or localhost)
2. Navigate to a photo
3. Click **Edit** button
4. Check browser console (F12):
   - ✅ Should see: `✅ Image loaded successfully`
   - ❌ Should NOT see: CORS errors

---

## 🔍 Troubleshooting

### Error: "Bucket not found"
- Verify project ID: `gcloud config list`
- Check bucket exists: `gsutil ls`

### Error: "Permission denied"
- Ensure you're logged in: `gcloud auth login`
- Check you have Storage Admin role in Firebase

### CORS still not working after deploy
- Clear browser cache (Ctrl+Shift+Del)
- Wait 2-3 minutes for changes to propagate
- Try incognito window

---

## 📞 Get Help

If stuck, contact:
- Claude Code developer
- Firebase Support: https://firebase.google.com/support

---

**Status:** ⏳ Waiting for Roger to deploy  
**Next Step:** Run `gsutil cors set cors.json gs://YOUR-BUCKET.appspot.com`
