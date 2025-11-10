# Firebase Database Rules Setup

## Problem
You're seeing permission denied errors like:
```
Error: permission_denied at /team: Client doesn't have permission to access the desired data.
Error: permission_denied at /settings: Client doesn't have permission to access the desired data.
Error: permission_denied at /users: Client doesn't have permission to access the desired data.
```

## Solution
You need to update your Firebase Realtime Database security rules.

## Option 1: Manual Update (Quick - Recommended for Testing)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **Maryam's Furniture Store**
3. Click on **Realtime Database** in the left menu
4. Click on the **Rules** tab
5. Replace all the existing rules with the content from `database.rules.json` file
6. Click **Publish** button

## Option 2: Using Firebase CLI (Production)

### First Time Setup:
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Realtime Database
# - Choose your existing project
# - Use database.rules.json as your rules file
```

### Deploy Rules:
```bash
# Deploy only database rules
firebase deploy --only database

# Or deploy everything
firebase deploy
```

## Database Rules Explanation

The `database.rules.json` file contains security rules that:

1. **Public Read Access:**
   - Categories, Products, Deals, Team, Settings can be read by anyone
   - This allows your public website to display data

2. **Admin Write Access:**
   - Only users with `role: 'admin'` in the users table can write to:
     - Categories
     - Products
     - Deals
     - Team
     - Settings
     - Can read all users data

3. **User-Specific Access:**
   - Users can read/write their own cart data
   - Users can read/write their own profile in users table
   - Users can view their own orders

4. **Newsletter:**
   - Anyone can subscribe (write)
   - Only admins can read subscriber list

## Testing After Deployment

1. **As Regular User:**
   - You should be able to browse products, categories, and team page
   - You should NOT be able to add/edit products or team members

2. **As Admin:**
   - Login with your admin account (ba5304831@gmail.com)
   - You should be able to:
     - View dashboard statistics
     - Add/edit/delete team members
     - Manage products, categories, and deals
     - View all orders and customers

## Troubleshooting

If you still see permission errors after deploying rules:

1. **Check if rules are deployed:**
   - Go to Firebase Console → Realtime Database → Rules
   - Verify the rules match database.rules.json

2. **Check your admin status:**
   ```javascript
   // In browser console
   firebase.auth().currentUser.uid
   // Then check in Firebase Database if this user has role: 'admin'
   ```

3. **Clear browser cache:**
   - Sometimes old rules are cached
   - Try in incognito mode

4. **Check authentication:**
   - Make sure you're logged in
   - Check browser console for auth errors

## Important Notes

- **Never use** `".read": true, ".write": true` in production - this allows anyone to modify your data
- Always test rules in Firebase Console's Rules Simulator before deploying
- Keep admin credentials secure
- The current rules assume admin role is set in `/users/{userId}/role`

## Contact

If you need help deploying these rules, contact your Firebase project administrator.
