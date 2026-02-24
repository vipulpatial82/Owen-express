# Owen Express - Food Delivery Platform

A full-stack MERN food delivery application for single restaurant management with direct customer ordering.

## 🚀 Features

### Customer Features
- User authentication (Login/Signup with bcrypt password hashing)
- Browse menu with veg/non-veg filters
- Interactive ingredient display (3D flip cards)
- Search functionality
- Shopping cart with localStorage persistence
- Order placement with multiple payment options (UPI/Card/COD)
- Order history with rating system
- Responsive design

### Admin Features
- Admin panel for menu management
- Add/Edit/Delete menu items
- Mark items as "Chef's Special"
- Image upload for food items
- Veg/Non-veg classification
- Real-time menu updates

## 🛠️ Tech Stack

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- React Icons
- Vite

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt (Password Hashing)
- Multer (File Upload)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn



### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
MONGO_URI=mongodb://127.0.0.1:27017/foodshop
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Start backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`
Backend will run on: `http://localhost:5000`

## 👤 Default Admin Credentials
```
Email: admin@gmail.com
Password: admin123
```

## 📁 Project Structure
```
owen-express/
├── backend/
│   ├── controllers/
│   │   ├── itemController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── Item.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── routes/
│   │   ├── itemRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── .env
│   ├── app.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ItemList.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   ├── Payment.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Showcase.jsx
│   │   │   ├── Search.jsx
│   │   │   └── OrderHistory.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── images/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🎯 Key Features Explained

### Password Security
- All passwords are hashed using bcrypt (10 salt rounds)
- Secure JWT token-based authentication
- Protected routes for authenticated users

### Cart Management
- Prevents duplicate items
- Persists in localStorage
- Clears on logout

### Order System
- Multiple payment methods
- Order tracking
- Rating and review system

### Admin Panel
- Full CRUD operations
- Image upload for menu items
- Chef's special marking
- Veg/Non-veg classification

## 🌐 API Endpoints

### User Routes
- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/verify` - Verify JWT token

### Item Routes
- `GET /api/items` - Get all items
- `POST /api/items` - Create item (Admin)
- `PUT /api/items/:id` - Update item (Admin)
- `DELETE /api/items/:id` - Delete item (Admin)

### Order Routes
- `POST /api/orders/payment` - Place order
- `GET /api/orders/user/:email` - Get user orders
- `PUT /api/orders/:id/rate` - Rate order

## 🎨 Color Scheme
- Primary: Orange (#ea580c) to Red (#dc2626) gradient
- Background: #fff5f0
- Success: Green (#16a34a)
- Error: Red (#dc2626)

## 🔒 Security Features
- Bcrypt password hashing
- JWT authentication
- Protected API routes
- Input validation
- CORS enabled

## 📱 Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Works on all screen sizes

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render/Railway)
1. Push to GitHub
2. Connect to Render/Railway
3. Add environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Update MONGO_URI in .env

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.

## 📄 License
MIT

## 👨‍💻 Author
**Your Name**
- GitHub[vipul patial](https://github.com/vipulpatial82)

## 🙏 Acknowledgments
- React Icons
- Tailwind CSS
- MongoDB
- Express.js

---
