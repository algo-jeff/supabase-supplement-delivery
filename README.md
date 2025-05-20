# Supabase Supplement Delivery Tracker

A Next.js application that displays data from a Supabase `supplement_delivery` table. This project is designed to be easily imported and deployed on Vercel.

## Features

- Display supplement delivery information
- Real-time data from Supabase
- Responsive design with Tailwind CSS
- Easy deployment to Vercel

## Prerequisites

Before you begin, you need to set up a Supabase project:

1. Create a Supabase account at [supabase.com](https://supabase.com) if you don't have one
2. Create a new Supabase project
3. In your Supabase project, create a `supplement_delivery` table with the following schema:

```sql
CREATE TABLE supplement_delivery (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  supplement_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  delivery_status TEXT NOT NULL,
  tracking_number TEXT,
  notes TEXT
);
```

4. Insert some sample data (optional)

```sql
INSERT INTO supplement_delivery 
  (name, email, address, supplement_name, quantity, delivery_status, tracking_number, notes) 
VALUES 
  ('John Doe', 'john@example.com', '123 Main St, Anytown, USA', 'Vitamin D3', 2, 'delivered', 'TRK12345', 'Delivered on time'),
  ('Jane Smith', 'jane@example.com', '456 Oak St, Somewhere, USA', 'Omega-3', 1, 'in_transit', 'TRK67890', 'Expected delivery in 2 days'),
  ('Alex Johnson', 'alex@example.com', '789 Pine St, Elsewhere, USA', 'Zinc Supplement', 3, 'pending', NULL, 'Processing order');
```

5. Get your Supabase URL and anon key from the project settings

## Deployment to Vercel

### Option 1: One-Click Deployment

The easiest way to deploy this project to Vercel is to click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falgo-jeff%2Fsupabase-supplement-delivery)

### Option 2: Manual Import

1. Go to [vercel.com](https://vercel.com)
2. Click on "Add New" > "Project"
3. Select "Import Git Repository"
4. Select this GitHub repository or fork it first if you want to make changes
5. In the configuration step, add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase project anonymous key
6. Click "Deploy"

## Local Development

To run this project locally:

1. Clone the repository
   ```bash
   git clone https://github.com/algo-jeff/supabase-supplement-delivery.git
   cd supabase-supplement-delivery
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file (copy from `.env.example`) and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Customization

- Modify `utils/supabase.ts` if your table schema is different
- Edit the UI in `app/page.tsx` to change how the data is displayed
- Add more pages or features as needed

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)