# MyShop (React + Express + MongoDB)

A simple e-commerce demo app with:
- Product listing + create/edit/delete (owner/admin rules)
- Orders (buy-now flow)
- Admin Panel (mass product delete, order status updates, delete orders, create admin users)

---

## Requirements

- Node.js (LTS recommended)
- MongoDB Atlas or local MongoDB
- npm

---

## Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongo_connection_string
PORT=5000
JWT_SECRET=some_long_random_string
```

---

## Install

From the project root:

```bash
npm install
```

If you have a separate `client/` package, also run:

```bash
cd client
npm install
cd ..
```

---

## Run (Dev)

From the project root:

```bash
npm run dev
```

This should start:
- Express API on `http://localhost:5000`
- React app (usually `http://localhost:3000`)

---

## Admin Panel

### Access
- The **Admin Panel** link appears in the navbar only when a logged-in user has `role: "admin"`.

### Admin Features
- **Products tab**: view/search/select many/delete many
- **Orders tab**: view/search/update status/delete + expand to view order items
- **Create Admin tab**: create admin users directly from the panel

---

## Creating Admin Users (Important)

Creating an admin user does **NOT** go through the normal `/register` flow, because that creates regular users.

The Admin Panel uses:

```http
POST /api/admin/users/admin
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{
  "name": "New Admin",
  "email": "admin2@example.com",
  "password": "password123"
}
```

The backend must set `role: "admin"` for that user.

---

## Common Issues

### `Router.use() requires a middleware function but got a Object`

This usually means you imported middleware incorrectly.

✅ Correct:
```js
const auth = require("../middleware/auth");
const { requireAdmin } = require("../middleware/requireAdmin");
router.use(auth, requireAdmin);
```

❌ Wrong:
```js
const requireAdmin = require("../middleware/requireAdmin"); // exports { requireAdmin }
router.use(auth, requireAdmin); // requireAdmin is an object, not a function
```

---

## License
Demo / educational use.
