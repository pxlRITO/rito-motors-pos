-- SQL Schema for RitoMotors POS System

-- 1. PROFILES TABLE
-- This table stores user roles and additional information linked to auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('Admin', 'Sales Agent', 'Customer')),
  contact_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 2. CARS TABLE
create table cars (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year int not null,
  vin text unique not null,
  price numeric(12, 2) not null,
  status text check (status in ('Available', 'Reserved', 'Sold')) default 'Available',
  specs text[] default '{}',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on cars
alter table cars enable row level security;

-- Policies for cars
create policy "Cars are viewable by everyone." on cars
  for select using (true);

create policy "Only admins can modify cars." on cars
  for all using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'Admin'
    )
  );

-- 3. SALES TABLE
create table sales (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  customer_name text not null,
  customer_contact text,
  customer_email text,
  car_id uuid references cars(id),
  agent_id uuid references auth.users(id),
  payment_method text check (payment_method in ('Cash', 'Bank Transfer', 'Financing')),
  subtotal numeric(12, 2) not null,
  tax_rate numeric(5, 2) default 0,
  tax numeric(12, 2) default 0,
  dealership_fee numeric(12, 2) default 0,
  discount numeric(12, 2) default 0,
  grand_total numeric(12, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on sales
alter table sales enable row level security;

-- Policies for sales
create policy "Sales are viewable by authenticated users." on sales
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert sales." on sales
  for insert with check (auth.role() = 'authenticated');

-- 4. CUSTOMER INQUIRIES TABLE
create table customer_inquiries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid references cars(id) on delete cascade,
  customer_id uuid references auth.users(id),
  customer_name text not null,
  customer_contact text not null,
  customer_email text not null,
  payment_method text check (payment_method in ('Cash', 'Bank Transfer', 'Financing')),
  message text,
  staff_message text,
  status text check (status in ('Pending', 'Contacted', 'Converted', 'Cancelled')) default 'Pending',
  customization jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on customer_inquiries
alter table customer_inquiries enable row level security;

-- Policies for customer_inquiries
create policy "Public and customers can insert inquiries." on customer_inquiries
  for insert with check (true);

create policy "Customers can view their own inquiries." on customer_inquiries
  for select using (auth.uid() = customer_id);

create policy "Staff can view all inquiries." on customer_inquiries
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('Admin', 'Sales Agent')
    )
  );

create policy "Staff can update all inquiries." on customer_inquiries
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('Admin', 'Sales Agent')
    )
  );

-- SAMPLE DATA FOR CARS (12 Units)
-- image_url is left NULL so staff can upload correct photos to Supabase Storage
insert into cars (make, model, year, vin, price, status, specs, image_url) values
('Toyota', 'Camry', 2024, 'VIN2024TYTCAMRY01', 35000.00, 'Available', ARRAY['Leather Seats', 'Sunroof', 'Navigation', 'V6 Engine'], NULL),
('Honda', 'Civic', 2023, 'VIN2023HNDCIVIC02', 28000.00, 'Available', ARRAY['Backup Camera', 'Apple CarPlay', 'Turbocharged', 'Sport Mode'], NULL),
('Tesla', 'Model 3', 2024, 'VIN2024TSLAMOD303', 42000.00, 'Available', ARRAY['Autopilot', 'Premium Sound', 'Glass Roof', 'Dual Motor'], NULL),
('BMW', 'X5', 2024, 'VIN2024BMWRX50004', 65000.00, 'Available', ARRAY['AWD', 'Heated Seats', 'Panoramic Sunroof', 'M Sport Package'], NULL),
('Ford', 'Mustang', 2024, 'VIN2024FORDMUST05', 45000.00, 'Available', ARRAY['V8 Engine', 'Sport Exhaust', 'Brembo Brakes', 'Manual Transmission'], NULL),
('Toyota', 'Supra', 2024, 'VIN2024TYTSUPRA06', 58000.00, 'Available', ARRAY['3.0L Turbo', 'JBL Sound', 'Active Suspension', 'Carbon Fiber Trim'], NULL),
('Nissan', 'GT-R', 2023, 'VIN2023NISSGTR007', 115000.00, 'Available', ARRAY['Twin Turbo V6', 'AWD', 'Recaro Seats', 'Bose Audio'], NULL),
('Mitsubishi', 'Montero Sport', 2024, 'VIN2024MITSMSPO08', 42000.00, 'Available', ARRAY['Diesel Turbo', '4WD', '7-Seater', 'Power Tailgate'], NULL),
('Toyota', 'Fortuner', 2024, 'VIN2024TYTFORTU09', 48000.00, 'Available', ARRAY['GD-Diesel', 'TRD Sportivo', 'AWD', 'Touchscreen'], NULL),
('Ford', 'Ranger', 2024, 'VIN2024FORDRANG10', 38000.00, 'Available', ARRAY['Wildtrak', 'Biturbo', 'Offroad Package', 'Sync 4'], NULL),
('Hyundai', 'Tucson', 2024, 'VIN2024HYUNTUCS11', 32000.00, 'Available', ARRAY['SmartSense', 'Wireless Charging', 'LED Lighting', 'HTRAC AWD'], NULL),
('Mazda', 'CX-5', 2024, 'VIN2024MAZDCX5012', 34000.00, 'Available', ARRAY['Skyactiv-G', 'Bose Sound', 'Nappa Leather', 'i-Activ AWD'], NULL);
