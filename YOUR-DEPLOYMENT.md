# 🎯 Your Deployment Configuration

## ✅ Your Live URLs

**Backend:** https://owen-express-v9d1.vercel.app
**Frontend:** https://owen-express-bqeo-pvxkebvxd-vipulpatial82s-projects.vercel.app

---

## 🔧 Configuration Steps

### **1. Update Frontend Environment Variable**

Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add:
```
VITE_API_URL=https://owen-express-v9d1.vercel.app
```

Then **Redeploy** the frontend.

---

### **2. Update Backend Environment Variables**

Go to Vercel Dashboard → Backend Project → Settings → Environment Variables

Ensure these are set:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.dxp3qzv.mongodb.net/foodshop?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=Vipul@FoodShopAuth#2026$SecureKey
NODE_ENV=production
```

---

### **3. Push CORS Update**

I've already updated the backend CORS. Now push to GitHub:

```bash
git add .
git commit -m "Configure CORS for production"
git push
```

Backend will auto-redeploy on Vercel.

---

### **4. Get Custom Frontend URL (Optional)**

Your current frontend URL is long. To get a cleaner URL:

1. Go to Vercel Dashboard → Frontend Project → Settings → Domains
2. You'll see a shorter production URL like: `https://owen-express-bqeo.vercel.app`
3. Use that instead!

---

## 🧪 Testing Checklist

Visit: https://owen-express-bqeo-pvxkebvxd-vipulpatial82s-projects.vercel.app

1. ✅ Signup new user
2. ✅ Login
3. ✅ Browse menu
4. ✅ Add to cart
5. ✅ Place order
6. ✅ Check order history
7. ✅ Admin login: admin@gmail.com / admin123
8. ✅ Add menu items (images won't work - see below)

---

## ⚠️ Image Upload Issue

Vercel serverless = read-only filesystem. Images won't persist.

**Solution:** Use Cloudinary (5 minutes setup)

1. Sign up: https://cloudinary.com (free)
2. Get credentials from dashboard
3. Add to backend environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. I can help you update the code if needed!

---

## 🔄 Auto-Deploy

Every `git push` will auto-deploy both frontend and backend!

---

## 🐛 If Something's Not Working

**Check Backend Logs:**
- Vercel Dashboard → Backend Project → Deployments → Click latest → View Function Logs

**Check Frontend Console:**
- Open browser DevTools → Console tab
- Look for API errors

**Common Issues:**
- CORS error → Backend CORS not updated (already fixed)
- API not found → Frontend VITE_API_URL not set
- MongoDB error → Check MONGO_URI in backend env vars

---

## 📱 Share Your App

Frontend: https://owen-express-bqeo-pvxkebvxd-vipulpatial82s-projects.vercel.app
(Or shorter URL from Vercel domains settings)

Admin Panel: Add `/admin` to URL
Login: admin@gmail.com / admin123

---

## 🎉 You're Live!

Your food delivery platform is now deployed and accessible worldwide!
