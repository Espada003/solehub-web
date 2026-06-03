# Chunk 5 — Frontend Install Instructions

This is the **first time** we're shipping a frontend, so this install is different from the backend chunks. The frontend is a **separate project** — it does not replace your backend folder.

You'll end up with **two folders** running together:

```
solehub-api    ← backend (Chunks 1-4) — keeps running on port 4000
solehub-web    ← frontend (this chunk) — runs on port 3000
```

Both must be running at the same time for the site to work.

## What you need

- The same Node.js you already installed for the backend
- The backend (`solehub-api`) must be running and reachable at `http://localhost:4000/api/v1`

## Install steps

### 1. Make sure the backend is running

Open a terminal, navigate to your `solehub-api` folder (the latest one — chunk4), and run:
```
npm run dev
```
Leave that terminal alone. The backend should say `SoleHub API listening on http://localhost:4000/api/v1`.

### 2. Unzip the frontend

You've downloaded `solehub-web.zip`. Unzip it somewhere — your Desktop or Downloads is fine. You'll get a folder called `solehub-web`.

### 3. Open a SECOND terminal

Open a new Command Prompt window (don't close the one running the backend). Navigate to the new folder:
```
cd path\to\solehub-web
```
Confirm with `dir` (Windows). You should see `package.json`, `src`, `tailwind.config.js`, etc.

### 4. Install dependencies

```
npm install
```
This downloads Next.js, React, Tailwind, TanStack Query, etc. Takes 1-2 minutes. You'll see some `npm warn` lines about deprecated transitive packages — ignore them.

### 5. Configure the API URL

```
copy .env.example .env
```
Open `.env` in any text editor. You should see:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
If your backend is on a different host or port, edit accordingly. Otherwise leave as-is and save.

### 6. Start the frontend

```
npm run dev
```
You'll see something like:
```
▲ Next.js 14.2.35
  - Local:        http://localhost:3000

✓ Ready in 2.3s
```

Leave this terminal open too.

### 7. Open the site

In your browser, go to:
```
http://localhost:3000
```

You should see the SoleHub home page with featured products loaded from your backend.

## What to test (5-minute walkthrough)

1. **Browse products** — Click "Shop now" or "Products" in the nav. You should see your seeded products with filters and search.

2. **Click a product** — Goes to the detail page with the "Add to cart" button.

3. **Try to add to cart without logging in** — Should redirect you to `/login`.

4. **Log in as customer**: `customer@solehub.local` / `Customer@12345`. After login, the navbar should show Cart, My orders, etc.

5. **Add an item, view cart, check out** — Fill in the shipping address form, click "Place order". You should land on the order detail page with a "Pay now" button.

6. **Click Pay now** — Order status flips to PAID. The order is now in your history.

7. **Log out, log in as Staff** (`staff@solehub.local` / `Staff@12345`). The navbar should now show Manage products, Inventory, All orders. Cart and My orders should be gone (staff aren't customers).

8. **Log in as Super Admin** (`admin@solehub.local` / `Admin@12345`). You should see everything in the nav: products, inventory, orders, users, reports, payroll, audit, my payroll.

9. **Try a negative test** — While logged in as a Customer, type `http://localhost:3000/admin/users` in the URL bar. The page should redirect you to home because customers can't access that page.

If all that works, the frontend is healthy.

## Common gotchas

**"Network error" or no data loading** — The frontend can't reach the backend. Check:
- Is the backend terminal still showing `SoleHub API listening on ...`?
- Does your `.env` have the right URL?
- Open the browser DevTools (F12) → Console tab → look for red CORS errors. If so, check your backend's `.env` has `CORS_ORIGIN=http://localhost:3000`.

**Port 3000 already in use** — Stop whatever's using it, or run `npm run dev -- -p 3001` and update the backend's CORS_ORIGIN to match.

**"You appear to be logged out" after refresh** — Check browser DevTools → Application tab → Local Storage. You should see `solehub.accessToken` etc. If they're missing, the login didn't store them properly. Try logging in again.

## Notes

This frontend uses **localStorage for tokens**, the same way Postman would use Bearer tokens. This is intentional — it keeps the frontend and Postman testing model identical for your students. The README inside the zip has more detail.

Tell me when this is running and we'll move to Chunk 6 (deployment guide).
