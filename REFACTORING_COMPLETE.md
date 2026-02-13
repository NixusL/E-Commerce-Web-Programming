# Project Refactoring Complete ✅

This document describes the new project structure after refactoring the MERN app from a messy root-level layout to a clean, organized architecture.

## New Structure

### Root Level
- `backend/` - All Express/MongoDB API code
- `frontend/` - React client application
- `.env` - Backend environment variables (root or backend/.env)
- `.env.example` - Documentation of required environment variables
- `package.json` - Root package with scripts for running backend, frontend, or both
- `package-lock.json` - Root dependencies lock file

### Backend Structure (`backend/src/`)
```
backend/
├── src/
│   ├── server.js              # Entry point: loads .env and starts app
│   ├── app.js                 # Express setup: middleware, routes, listeners
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Route handlers (unchanged logic)
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middleware/            # Express middleware (unchanged logic)
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── requireAdmin.js
│   │   └── role.js
│   ├── models/                # Mongoose models (unchanged logic)
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Report.js
│   │   ├── SellerRequest.js
│   │   └── User.js
│   └── routes/                # Route definitions (unchanged logic)
│       ├── adminRoutes.js
│       ├── authRoutes.js
│       ├── cartRoutes.js
│       ├── orderRoutes.js
│       ├── productRoutes.js
│       ├── reportRoutes.js
│       └── userRoutes.js
├── uploads/                   # User-uploaded files
├── package.json               # Shared with root for now
└── .env.example              # Backend env vars documentation

Key Changes:
- server.js split into server.js (entry/listen) + app.js (setup/middleware)
- All relative require paths remain unchanged (within backend/src)
- .env loading updated to reference root or backend directory
```

### Frontend Structure (`frontend/src/`)
```
frontend/
├── src/
│   ├── index.js              # App bootstrap
│   ├── App.js                # Root component with Routes
│   ├── App.css               # Global styles
│   ├── pages/                # Route-level page components
│   │   ├── Home/
│   │   │   └── HomePage.jsx
│   │   ├── Products/
│   │   │   └── ProductsPage.jsx
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── Orders/
│   │   │   └── MyOrdersPage.jsx
│   │   ├── Seller/
│   │   │   ├── MyProductsPage.jsx
│   │   │   ├── AddProductPage.jsx
│   │   │   ├── EditProductPage.jsx
│   │   │   ├── SellerRequestPage.jsx
│   │   │   └── SellerRefundsPage.jsx
│   │   ├── Admin/
│   │   │   └── AdminPanelPage.jsx
│   │   ├── Cart/
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── CheckoutSuccessPage.jsx
│   │   └── Report/
│   │       └── ReportProductPage.jsx
│   ├── components/            # Reusable UI components (future organization)
│   ├── context/              # React Context (state management)
│   │   └── CartContext.js     # Shopping cart state
│   ├── services/             # API/external service helpers
│   │   └── apiClient.js       # Centralized API_BASE, auth helpers
│   ├── utils/                # Utility functions
│   │   ├── refundStatus.js    # Status formatting helper
│   │   └── authHelpers.js     # Auth utility functions
│   ├── styles/               # Global/shared CSS (future use)
│   ├── constants/            # App constants
│   │   └── categories.js      # Product categories
│   ├── assets/               # Images, icons (future use)
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── package.json
│   └── .env.example
└── README.md

Key Changes:
- Pages moved from flat src/ to organized pages/<Category>/ folders
- All .js renamed to .jsx for clarity
- CartContext moved from cart/ to context/ folder
- apiClient.js centralizes API_BASE and auth helpers (getToken, readStoredUser, pushToast)
- All imports updated from relative paths to new locations
```

## Running the Application

### Development Mode (Recommended)

**Run Both Backend and Frontend Concurrently:**
```bash
npm install                    # Install root dependencies (includes concurrently)
npm run dev                    # Runs backend + frontend simultaneously
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**Run Backend Only:**
```bash
npm run dev:backend            # Runs backend with nodemon (auto-reload)
```

**Run Frontend Only:**
```bash
npm run dev:frontend           # Runs React dev server
```

### Production Build

```bash
npm run build                  # Builds frontend for production
```

Output will be in `frontend/build/`

## Import Path Changes

### Frontend Examples

**Before:**
```javascript
import HomePage from "./HomePage";
import { useCart } from "./cart/CartContext";
import { prettyRefundStatus } from "./utils/refundStatus";
const API_BASE = "http://localhost:5000";
function getToken() { ... }
```

**After:**
```javascript
import HomePage from "./pages/Home/HomePage";
import { useCart } from "./context/CartContext";
import { prettyRefundStatus } from "./utils/refundStatus";
import { API_BASE, getToken, pushToast, readStoredUser } from "./services/apiClient";
```

### Backend (No Changes Required)
All backend requires remain the same because relative paths are preserved:
```javascript
const productRoutes = require("./routes/productRoutes");  // Still works!
const connectDB = require("./config/db");                 // Still works!
```

## Environment Variables

### Root `.env` (or `backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_xxxxx
NODE_ENV=development
```

### Frontend `.env` (Optional)
```
REACT_APP_API_BASE=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`

## API Endpoints (Unchanged)
All API endpoints remain exactly the same:
- `/api/auth/*` - Authentication
- `/api/products/*` - Products
- `/api/cart/*` - Shopping cart
- `/api/orders/*` - Orders
- `/api/admin/*` - Admin panel
- `/api/users/*` - User management
- `/api/reports/*` - Product reports

## Notes

1. **No Functionality Changed** - This is purely a structural refactor
2. **Git History** - The move will show as file renames/adds in git history
3. **Node Modules** - Install dependencies at root: `npm install` (covers both backend and frontend)
4. **Database** - Make sure MongoDB is running before starting the backend
5. **Uploads** - User uploads still go to `backend/uploads/` and are served from `/uploads`

## Troubleshooting

**"Cannot find module" errors after refactor?**
- Make sure you've updated all import paths in frontend pages
- Verify `backend/src/app.js` path references are correct
- Check that relative paths in backend controllers/models haven't changed

**Frontend not connecting to API?**
- Ensure backend is running on port 5000
- Check `REACT_APP_API_BASE` in frontend if you've set a custom value
- Verify CORS is enabled in `backend/src/app.js`

**Nodemon not reloading?**
- Make sure you're watching `backend/src/server.js`
- Kill any lingering node processes: `pkill -f node`

## Next Steps (Optional Improvements)

1. Organize reusable UI components in `frontend/src/components/`
2. Extract CSS into `frontend/src/styles/`
3. Add more utility functions to `frontend/src/utils/`
4. Move static assets to `frontend/src/assets/`
5. Add E2E tests in a `tests/` folder
6. Create separate `backend/package.json` if backend dependencies diverge
