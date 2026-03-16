# 🎒 CampusCart - Complete Setup Guide

## ✅ Prerequisites
- Node.js installed
- Supabase account (https://supabase.com)
- npm or yarn package manager

---

## Step 1: Set Up Supabase Database

### 1. Create Tables & Policies
1. Go to your Supabase project → **SQL Editor**
2. Copy the entire contents of `SUPABASE_SETUP.sql` from this folder
3. Paste it into the SQL Editor
4. Click **Run** and wait for completion

### 2. Create Storage Bucket (Optional - for profile pictures)
1. Go to **Storage** → **Create a new bucket**
2. Name it: `avatars`
3. Set it to **PUBLIC** (Allow public access)

---

## Step 2: Environment Setup

### Get Your Supabase Credentials
1. Go to your Supabase project **Settings → API**
2. Copy:
   - `Project URL` (called VITE_SUPABASE_URL)
   - `anon key` (called VITE_SUPABASE_ANON_KEY)

### Create .env File
1. Open your project root folder
2. Create a file called `.env` (if it doesn't exist)
3. Add these lines:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. Replace the values with your actual credentials from Supabase

---

## Step 3: Install Dependencies & Run

### Install npm packages
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173/` (or the next available port)

---

## Step 4: Test the App

### Create an Account
1. Click **"Create one →"** on the login page
2. Fill in your details (email, password, course, year)
3. Click **Create Account**

### Log In
1. Use the email and password you just created
2. You should be redirected to the **Dashboard**
3. Look for your name in the top-right navbar

### Edit Profile
1. Click **Profile** in the navbar
2. Click **Edit Profile** button
3. Make changes and click **Save Changes**
4. Verify changes are saved in Supabase (`profiles` table)

### Manage Settings
1. Click **Settings** in the navbar
2. Toggle settings on/off
3. Click **Save Changes**
4. Verify settings are saved in Supabase (`user_settings` table)

---

## Step 5: Verify Supabase Connection

### Check in Supabase Dashboard
1. Go to **Table Editor**
2. Select **profiles** table → You should see your user record
3. Select **user_settings** table → You should see your settings

### Check Browser Console
1. Open **DevTools** (F12)
2. Go to **Console** tab
3. On login, you should see:
```
✅ Supabase login successful
```

---

## 🚀 Troubleshooting

### "Failed to load profile" Error
**Cause:** The `profiles` table doesn't exist or permissions are wrong
**Fix:**
1. Run the SQL from `SUPABASE_SETUP.sql` again
2. Ensure **Row Level Security (RLS)** is enabled
3. Check that RLS policies are created

### "Cannot read property 'user_id' of null"
**Cause:** Not logged in or session expired
**Fix:**
1. Log out and log back in
2. Check browser console for errors

### "SUPABASE_URL is missing"
**Cause:** `.env` file not set up correctly
**Fix:**
1. Verify `.env` file exists in project root
2. Check credentials are correct (no extra spaces)
3. Restart the dev server

### Cart not showing
**Cause:** Supabase connection not working
**Fix:**
1. Check DevTools console for errors
2. Verify `.env` file has correct Supabase credentials
3. Restart dev server: `npm run dev`

---

## 📁 Project Structure

```
ecommerce-react/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx     (Store & products)
│   │   ├── Login.jsx          (Sign in)
│   │   ├── Register.jsx       (Create account)
│   │   ├── Profile.jsx        (Edit profile)
│   │   ├── Settings.jsx       (User settings)
│   │   ├── Cart.jsx           (Shopping cart)
│   │   └── Payment.jsx        (Checkout)
│   ├── App.jsx                (Main app - handles auth)
│   ├── supabase.js            (Supabase config)
│   └── supabaseclient.js      (Alternative import)
├── SUPABASE_SETUP.sql         (Database setup)
└── .env                       (Your credentials)
```

---

## ✨ Features

- ✅ User Authentication (Sign up / Login)
- ✅ Profile Management (Edit name, course, year)
- ✅ Settings Management (Toggle notifications, appearance, privacy)
- ✅ Shopping Cart (Add / Remove items)
- ✅ Fully Connected to Supabase
- ✅ Row Level Security for data privacy
- ✅ Real-time profile updates

---

## 🔧 Technology Stack

- **Frontend:** React + Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (optional - for profile pictures)
- **Styling:** CSS

---

## 📞 Need Help?

1. Check the browser **DevTools Console** for error messages
2. Verify Supabase credentials in `.env`
3. Make sure all SQL from `SUPABASE_SETUP.sql` was executed
4. Check that Row Level Security policies are in place

---

**Happy coding! 🚀**
