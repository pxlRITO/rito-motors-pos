# RitoMotors POS System

A complete, fully functional Car Dealership Point of Sale system built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Secure login using Supabase Auth.
- **Role-Based Access**: Different views and permissions for Admins and Sales Agents.
- **Inventory Management**: Full CRUD for vehicles (Admin only).
- **POS / Checkout**: Streamlined sales process with live cost breakdown.
- **Invoice Generation**: Clean, printable invoices with dealership branding.
- **Customer Logs**: Historical record of all sales and invoices.
- **Reports**: Business performance analytics (Admin only).
- **Modern UI**: Dark/corporate blue automotive aesthetic, fully responsive.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase-schema.sql` and run it. This will create the `profiles`, `cars`, and `sales` tables with appropriate RLS policies and sample data.
4. Go to **Authentication > Users** and create two users:
   - `admin@test.com` (password: `admin123`)
   - `sales@test.com` (password: `sales123`)
5. After creating users, copy their **User IDs** and run the following SQL (replacing the IDs):

```sql
-- For Admin
insert into public.profiles (id, full_name, role)
values ('PASTE_ADMIN_USER_ID_HERE', 'Admin User', 'Admin');

-- For Sales Agent
insert into public.profiles (id, full_name, role)
values ('PASTE_SALES_USER_ID_HERE', 'Sales Agent', 'Sales Agent');
```

### 2. Local Environment Setup

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Supabase credentials (use `.env.example` as a template):
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Running Locally

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### 4. Build for Production

To create a production build:
```bash
npm run build
```

## Deployment

### GitHub
1. Create a new repository on GitHub.
2. Push your code:
   ```bash
   git init
   ```
   *Note: Ensure .env is in your .gitignore.*

### Vercel
1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard, add the **Environment Variables** (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
3. Deploy!

## Dealership Information

**RitoMotors**
Tagbilaran City, Bohol, Philippines
Phone: +63 912 345 6789
Email: sales@ritomotors.com
