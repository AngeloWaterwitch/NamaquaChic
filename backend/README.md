# NamakwaChic Backend

Express API with MongoDB Atlas + Cloudinary image uploads.

## Quick Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Then edit `.env` and fill in:

**MongoDB Atlas:**
- Go to https://cloud.mongodb.com → free cluster → Connect → Drivers
- Copy the connection string into `MONGO_URI`
- Replace `<username>` and `<password>` with your Atlas credentials

**Cloudinary:**
- Go to https://cloudinary.com → sign up free → Dashboard
- Copy Cloud Name, API Key, API Secret into the Cloudinary fields

**Admin credentials:**
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` — these become your login for the admin dashboard
- Keep `JWT_SECRET` as a long random string (it signs your login tokens)

### 3. Run the backend
```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```
Server runs on http://localhost:3000

### 4. Run the Angular frontend (separate terminal)
```bash
cd ..         # back to NamakwaChic root
npm install
ng serve
```
Frontend runs on http://localhost:4200

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/auth/login | — | Admin login → returns JWT token |
| GET | /api/auth/me | JWT | Verify token |
| GET | /api/products | — | List all products |
| POST | /api/products | JWT | Add product |
| PUT | /api/products/:id | JWT | Update product |
| DELETE | /api/products/:id | JWT | Delete product |
| POST | /api/upload/:folder | JWT | Upload image to Cloudinary |
| POST | /api/orders | — | Place order |
| GET | /api/orders | JWT | List all orders (admin) |
| PATCH | /api/orders/:id/status | JWT | Update order status |
| GET | /api/content/:page | — | Get site content |
| PUT | /api/content/:page | JWT | Save site content |
| GET | /api/subscribers | JWT | List subscribers |
| POST | /api/subscribers | — | Subscribe |
| DELETE | /api/subscribers/:id | JWT | Remove subscriber |
| GET | /api/blog | — | List published posts |
| POST | /api/blog | JWT | Add blog post |
| PUT | /api/blog/:id | JWT | Update blog post |
| DELETE | /api/blog/:id | JWT | Delete blog post |
