# Fix Firebase "Unauthorized Domain" Error

## The Error You're Seeing:
```
This domain is not authorized for OAuth operations for your Firebase project.
Edit the list of authorized domains from the Firebase console.
(auth/unauthorized-domain)
```

## What This Means:
Your local development URL (`localhost` or `127.0.0.1`) needs to be added to Firebase's list of authorized domains for social login to work.

---

## 🔧 How to Fix (5 Easy Steps):

### Step 1: Go to Firebase Console
Open: https://console.firebase.google.com/

### Step 2: Select Your Project
Click on **"furniture-shop-aa5fb"** (or your project name)

### Step 3: Go to Authentication Settings
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"** tab at the top
3. Click **"Authorized domains"** tab

### Step 4: Add Your Localhost URLs
Click **"Add domain"** button and add these domains one by one:

```
localhost
127.0.0.1
```

**Important:** Add both! Some browsers use `localhost` and others use `127.0.0.1`

### Step 5: Save
After adding both domains, the page will automatically save. You should now see:
- localhost
- 127.0.0.1
- furniture-shop-aa5fb.firebaseapp.com (already there)
- furniture-shop-aa5fb.web.app (already there)

---

## ✅ After Adding Domains:

1. **Refresh your browser** (press F5 or Ctrl+R)
2. **Try Google/Facebook login again**
3. **It should work now!** 🎉

---

## 📸 Visual Guide:

```
Firebase Console
    └── Your Project (furniture-shop-aa5fb)
        └── Authentication
            └── Settings
                └── Authorized domains tab
                    └── Click "Add domain"
                        └── Enter: localhost
                        └── Enter: 127.0.0.1
```

---

## 🎯 For Your Teacher Demo:

**BEFORE presenting:**
1. Add `localhost` and `127.0.0.1` to Firebase authorized domains (one-time setup)
2. Start your local server: `python -m http.server 8000`
3. Open: `http://localhost:8000`
4. Now social login (Google/Facebook) will work perfectly!

---

## 🔍 Troubleshooting:

**If it still doesn't work after adding domains:**
- Wait 1-2 minutes for Firebase to propagate the changes
- Clear your browser cache (Ctrl+Shift+Delete)
- Try in incognito/private window
- Make sure you're accessing via `http://localhost:8000` (not file://)

**If you see "localhost" already in the list:**
- Make sure to also add `127.0.0.1` (they're treated as different domains)
- Some development servers use one, some use the other

---

## ⚠️ Common Mistakes:

❌ **DON'T** add: `http://localhost:8000` (no protocol or port)
✅ **DO** add: `localhost`

❌ **DON'T** add: `http://127.0.0.1:5500`
✅ **DO** add: `127.0.0.1`

Firebase automatically handles the protocol and port - just add the domain name!

---

## 📝 Quick Checklist:

- [ ] Opened Firebase Console
- [ ] Selected correct project
- [ ] Navigated to Authentication → Settings → Authorized domains
- [ ] Added `localhost`
- [ ] Added `127.0.0.1`
- [ ] Saved changes
- [ ] Refreshed browser
- [ ] Tested social login

---

**That's it!** Your social login should now work perfectly for your demonstration. 🚀
