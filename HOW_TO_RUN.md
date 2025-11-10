# How to Run Elite Furniture Gallery Locally

## The Problem
You're seeing this error:
```
"location.protocol" must be http, https or chrome-extension
```

This happens because you're opening files directly (file://) instead of through a web server (http://).

## Quick Solution - Choose ONE method:

### Option 1: Python Server (EASIEST - Recommended)

**If you have Python installed:**

1. Open Command Prompt or Terminal
2. Navigate to your project folder:
   ```
   cd "C:\Users\Tahir Zaman Khalid\Downloads\Maryam-s-Furniture-Store-main"
   ```

3. Run ONE of these commands:

   **For Python 3:**
   ```
   python -m http.server 8000
   ```

   **For Python 2:**
   ```
   python -m SimpleHTTPServer 8000
   ```

4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Option 2: Live Server (VS Code Extension)

**If you use Visual Studio Code:**

1. Install "Live Server" extension from VS Code marketplace
2. Right-click on `index.html`
3. Click "Open with Live Server"
4. Your browser will open automatically at `http://127.0.0.1:5500`

### Option 3: PHP Server

**If you have PHP installed:**

1. Open Command Prompt
2. Navigate to project folder
3. Run:
   ```
   php -S localhost:8000
   ```
4. Open browser: `http://localhost:8000`

### Option 4: Node.js http-server

**If you have Node.js:**

1. Install http-server globally:
   ```
   npm install -g http-server
   ```

2. Navigate to project folder and run:
   ```
   http-server
   ```

3. Open browser at the URL shown (usually `http://localhost:8080`)

## What Will Work After Starting Server:

✅ Google Login (with popup)
✅ Facebook Login (with popup)
✅ All Firebase features
✅ Database operations
✅ File uploads
✅ All website functionality

## For Your Teacher Demonstration:

I recommend **Python server** because:
- Most computers have Python installed
- Very simple - just 2 commands
- No additional installation needed
- Works perfectly for demos

## Testing Social Login:

Once the server is running:

1. Go to `http://localhost:8000/client-login.html`
2. Click "Sign in with Google" or "Sign in with Facebook"
3. A popup will open for authentication
4. Login with your Google/Facebook account
5. You'll be redirected to the homepage

## Troubleshooting:

**If port 8000 is already in use:**
```
python -m http.server 8080
```
Then use: `http://localhost:8080`

**If Python is not installed:**
- Download from: https://www.python.org/downloads/
- Or use VS Code Live Server (easier)

**If popup is blocked:**
- Allow popups for localhost in your browser settings

---

**Need help?** Just follow Option 1 (Python Server) - it's the quickest!
