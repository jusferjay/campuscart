# ✅ CampusCart Complete Setup Checklist

## BEFORE YOU START
- [ ] Node.js is installed
- [ ] You have a Supabase account (free tier is fine)
- [ ] You have a text editor or IDE open

---

## STEP 1: SET UP SUPABASE (5 minutes)
- [ ] Go to https://supabase.com and log in
- [ ] Open your project → SQL Editor
- [ ] Copy ALL code from `SUPABASE_SETUP.sql` file
- [ ] Paste into SQL Editor and click **Run**
- [ ] Wait for "Query successful" message
- [ ] Go to **Storage** → Create new bucket named `avatars`
- [ ] Set bucket to **PUBLIC**

---

## STEP 2: GET YOUR CREDENTIALS (2 minutes)
- [ ] In Supabase, go to **Settings → API**
- [ ] Copy your **Project URL**
- [ ] Copy your **anon key** (not secret key!)
- [ ] Open `.env` file in your project root
- [ ] Add these lines:
  ```
  VITE_SUPABASE_URL=paste_your_project_url_here
  VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
  ```
- [ ] Save the `.env` file

---

## STEP 3: INSTALL & RUN (2 minutes)
- [ ] Open terminal in project folder
- [ ] Run: `npm install`
- [ ] Run: `npm run dev`
- [ ] Open browser at `http://localhost:5173/`

---

## STEP 4: TEST THE APP (5 minutes)

### Test Registration
- [ ] Click **"Create one →"** link
- [ ] Fill in form:
  - First Name: "John"
  - Last Name: "Doe"
  - Email: "john@example.com"
  - Password: "Test@1234"
  - Course: "BS Computer Science"
  - Year: "1st Year"
- [ ] Click **Create Account**
- [ ] See success message

### Test Login
- [ ] Use email: john@example.com
- [ ] Use password: Test@1234
- [ ] Should redirect to Dashboard
- [ ] Check top-right: Should show "John Doe"

### Test Profile
- [ ] Click **Profile** in navbar
- [ ] Click **Edit Profile**
- [ ] Change a field (e.g., Course to "BS Engineering")
- [ ] Click **Save Changes**
- [ ] See "Profile updated successfully!"
- [ ] Refresh page - change should still be there

### Test Settings
- [ ] Click **Settings** in navbar
- [ ] Toggle some settings on/off
- [ ] Click **Save Changes**
- [ ] See "Settings saved!"

### Test Shopping
- [ ] Click **Store** or **Dashboard** in navbar
- [ ] Click **Add to Cart** on any item
- [ ] See cart badge update
- [ ] Click **Cart** in navbar
- [ ] See your items

### Test Logout
- [ ] Click **Logout** button in top-right
- [ ] Should return to Login page
- [ ] Try logging in again with same credentials

---

## STEP 5: VERIFY SUPABASE CONNECTION

### In Browser Console
- [ ] Open DevTools (F12)
- [ ] Go to **Console** tab
- [ ] Log in and look for:
  ```
  ✅ Supabase login successful
  ```

### In Supabase Dashboard
- [ ] Go to **Table Editor**
- [ ] Check **profiles** table → Should have your user record
- [ ] Check **user_settings** table → Should have your settings
- [ ] Check that values match what you set in the app

---

## ✨ ALL DONE!

Your CampusCart app is now:
- ✅ Fully connected to Supabase
- ✅ Able to register new users
- ✅ Able to log in
- ✅ Able to edit profiles
- ✅ Able to manage settings
- ✅ Able to add items to cart
- ✅ Running without errors

---

## 🐛 TROUBLESHOOTING

### Issue: "Failed to load profile"
**Solution:**
1. Run `SUPABASE_SETUP.sql` again
2. Go to Supabase → **Authentication → Policies**
3. Verify RLS policies exist on `profiles` table

### Issue: ".env not found" or credentials not working
**Solution:**
1. Create `.env` file in project root
2. Add EXACTLY these lines:
   ```
   VITE_SUPABASE_URL=your_actual_url
   VITE_SUPABASE_ANON_KEY=your_actual_key
   ```
3. NO spaces around the `=` sign
4. Restart dev server: `npm run dev`

### Issue: "Cannot authenticate" on login
**Solution:**
1. Make sure you registered an account first
2. Use exact same email/password you registered with
3. Check DevTools Console for error messages

### Issue: Data not saving to Supabase
**Solution:**
1. Check browser Console for errors
2. Go to Supabase → Table Editor
3. Manually check if records exist
4. Verify RLS policies allow INSERT/UPDATE

### Issue: App won't start
**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run dev`

---

## 📱 WHAT YOU CAN NOW DO

1. **Create Account** - Users can register with email/password
2. **Log In/Out** - Secure authentication with Supabase
3. **Edit Profile** - Change name, course, year level
4. **Manage Settings** - Toggle notifications, appearance, privacy
5. **Shop** - Add items to cart, view cart, proceed to checkout
6. **Everything Persists** - All data is saved in Supabase database

---

**Congratulations! Your CampusCart is now fully operational! 🎉**
