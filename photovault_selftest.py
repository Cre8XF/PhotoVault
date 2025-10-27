import requests
import json
import sys
import firebase_admin
from firebase_admin import credentials, firestore, storage

# ---- KONFIG ----
FRONTEND_URL = "https://cre8web-photovault.netlify.app"
BUCKET = "photovault-app-a0946.firebasestorage.app"
SERVICE_ACCOUNT_FILE = "serviceAccount.json"  # legg service-konto her


# ---- RESULTAT ----
results = {}

def print_result(name, ok, detail=""):
    symbol = "✅" if ok else "❌"
    results[name] = (ok, detail)
    print(f"{symbol} {name}: {detail}")

# ---- 1. CORS TEST ----
def test_cors():
    url = f"https://firebasestorage.googleapis.com/v0/b/{BUCKET}/o"
    try:
        r = requests.options(url, timeout=5, headers={"Origin": FRONTEND_URL})
        allow = r.headers.get("access-control-allow-origin")
        ok = allow == FRONTEND_URL or allow == "*"
        print_result("CORS", ok, f"allow-origin={allow}")
    except Exception as e:
        print_result("CORS", False, str(e))

# ---- 2. STORAGE GET TEST ----
def test_storage_get():
    try:
        r = requests.get(f"https://firebasestorage.googleapis.com/v0/b/{BUCKET}/o?prefix=test", timeout=5)
        ok = r.status_code == 200
        print_result("Storage GET", ok, f"status={r.status_code}")
    except Exception as e:
        print_result("Storage GET", False, str(e))

# ---- 3. FIREBASE ADMIN INIT ----
def init_firebase():
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        firebase_admin.initialize_app(cred, {"storageBucket": BUCKET})
        print_result("Firebase init", True)
        return True
    except Exception as e:
        print_result("Firebase init", False, str(e))
        return False

# ---- 4. FIRESTORE TEST ----
def test_firestore():
    try:
        db = firestore.client()
        doc_ref = db.collection("selftest").document("ping")
        doc_ref.set({"ok": True})
        doc = doc_ref.get()
        ok = doc.exists and doc.to_dict().get("ok") is True
        doc_ref.delete()
        print_result("Firestore", ok, "write/read/delete OK" if ok else "failed")
    except Exception as e:
        print_result("Firestore", False, str(e))

# ---- 5. STORAGE UPLOAD TEST ----
def test_storage_upload():
    try:
        bucket = storage.bucket()
        blob = bucket.blob("selftest/test.txt")
        blob.upload_from_string("PhotoVault test OK")
        ok = blob.exists()
        blob.delete()
        print_result("Storage upload", ok, "upload/delete OK" if ok else "failed")
    except Exception as e:
        print_result("Storage upload", False, str(e))

# ---- MAIN ----
if __name__ == "__main__":
    print("\n=== PhotoVault Self-Test ===\n")
    test_cors()
    test_storage_get()
    if init_firebase():
        test_firestore()
        test_storage_upload()

    print("\n=== Result ===")
    for name, (ok, detail) in results.items():
        print(f"{'OK' if ok else 'FAIL'} - {name}: {detail}")

    failures = [k for k, (ok, _) in results.items() if not ok]
    print("\nSummary:", "✅ All passed" if not failures else f"❌ Failures: {', '.join(failures)}")
    sys.exit(1 if failures else 0)
