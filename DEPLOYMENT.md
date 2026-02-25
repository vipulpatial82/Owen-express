# 🚀 Vercel Deployment Guide

## Deploy Both Frontend & Backend on Vercel

### ✅ Prerequisites
- MongoDB Atlas account (already set up)
- GitHub account
- Vercel account (free)

---

## 📋 Step-by-Step Deployment

### **1. Push Code to GitHub**

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/food-owen.git
git branch -M main
git push -u origin main
```

---

### **2. Deploy Backend on Vercel**

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Project Name:** `owen-express-backend`
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

5. **Add Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.dxp3qzv.mongodb.net/foodshop?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=Vipul@FoodShopAuth#2026$SecureKey
   NODE_ENV=production
   ```

6. Click **Deploy**
7. Copy your backend URL (e.g., `https://owen-express-backend.vercel.app`)

---

### **3. Deploy Frontend on Vercel**

1. In Vercel Dashboard → **"Add New Project"**
2. Import same GitHub repository
3. Configure:
   - **Project Name:** `owen-express-frontend`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   ```
   VITE_API_URL=https://owen-express-backend.vercel.app
   ```
   (Replace with your actual backend URL from step 2)

5. Click **Deploy**
6. Your frontend will be live at: `https://owen-express-frontend.vercel.app`

---

### **4. Update Backend CORS**

After frontend is deployed, update `backend/app.js`:

```javascript
app.use(cors({
    origin: ['https://owen-express-frontend.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
```

Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Vercel will auto-redeploy backend.

---

## 🎯 Testing Your Deployment

1. Visit your frontend URL
2. Test signup/login
3. Login as admin: `admin@gmail.com` / `admin123`
4. Add menu items
5. Test ordering flow

---

## ⚠️ Important Notes

### Image Uploads Issue
Vercel serverless functions are read-only. For image uploads, you need to use:
- **Cloudinary** (recommended, free tier)
- **AWS S3**
- **Vercel Blob Storage**

### Quick Cloudinary Setup:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Install: `npm install cloudinary multer-storage-cloudinary`
4. Update multer config in backend

---

## 🔄 Auto-Deploy

Every time you push to GitHub:
- Backend auto-deploys
- Frontend auto-deploys

---

## 📱 Your Live URLs

- **Frontend:** `https://owen-express-frontend.vercel.app`
- **Backend:** `https://owen-express-backend.vercel.app`
- **Admin Panel:** `https://owen-express-frontend.vercel.app/admin`

---

## 🐛 Troubleshooting

**Backend not working?**
- Check environment variables in Vercel dashboard
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Check Vercel function logs

**Frontend can't connect to backend?**
- Verify VITE_API_URL is correct
- Check browser console for CORS errors
- Verify backend CORS settings

**Images not showing?**
- Use Cloudinary for production
- Or use absolute URLs for images

---

## 💡 Alternative: Deploy Backend on Render

If you prefer Render for backend (better for file uploads):

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build: `npm install`
6. Start: `npm start`
7. Add same environment variables
8. Update frontend VITE_API_URL to Render URL

---

## ✅ Deployment Complete!

Your food delivery app is now live! 🎉
