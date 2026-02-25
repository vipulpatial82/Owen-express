# 🚀 Quick Deployment Commands

## 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 2. Deploy Backend (Vercel)
- Go to vercel.com → New Project
- Root Directory: `backend`
- Add Environment Variables:
  - MONGO_URI=mongodb+srv://...
  - JWT_SECRET=Vipul@FoodShopAuth#2026$SecureKey
  - NODE_ENV=production
- Deploy → Copy backend URL

## 3. Deploy Frontend (Vercel)
- New Project → Same repo
- Root Directory: `frontend`
- Framework: Vite
- Add Environment Variable:
  - VITE_API_URL=https://your-backend-url.vercel.app
- Deploy

## 4. Update CORS in backend/app.js
```javascript
app.use(cors({
    origin: ['https://your-frontend-url.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
```

## 5. Push CORS Update
```bash
git add .
git commit -m "Update CORS"
git push
```

## ✅ Done! Your app is live!

Frontend: https://your-frontend-url.vercel.app
Backend: https://your-backend-url.vercel.app
