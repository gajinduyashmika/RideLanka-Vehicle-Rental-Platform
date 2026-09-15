-- Seed Customers
INSERT INTO users (id, full_name, email, password, role, created_at)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Sarah Miller', 'sarah.m@gmail.com', '$2a$10$IIZRVKdTnZHAJcKTvvzPgOz4bGxt1k4MYZUs1JdvGdbc7yjRZOMB.', 'CUSTOMER', NOW() - INTERVAL '20 days'),
  ('a2222222-2222-2222-2222-222222222222', 'James Tanaka', 'james.k@gmail.com', '$2a$10$IIZRVKdTnZHAJcKTvvzPgOz4bGxt1k4MYZUs1JdvGdbc7yjRZOMB.', 'CUSTOMER', NOW() - INTERVAL '15 days'),
  ('a3333333-3333-3333-3333-333333333333', 'Priya Sharma', 'priya.r@gmail.com', '$2a$10$IIZRVKdTnZHAJcKTvvzPgOz4bGxt1k4MYZUs1JdvGdbc7yjRZOMB.', 'CUSTOMER', NOW() - INTERVAL '10 days'),
  ('a4444444-4444-4444-4444-444444444444', 'Kasun Perera', 'kasun.p@gmail.com', '$2a$10$IIZRVKdTnZHAJcKTvvzPgOz4bGxt1k4MYZUs1JdvGdbc7yjRZOMB.', 'CUSTOMER', NOW() - INTERVAL '5 days')
ON CONFLICT (email) DO NOTHING;

-- Seed Vehicles
INSERT INTO vehicles (id, make, model, year, registration_number, category, transmission, daily_rate, image_url, status, branch, created_at)
VALUES
  -- 1. Cars
  ('b1111111-1111-1111-1111-111111111111', 'Toyota', 'Prius Hybrid', 2023, 'WP-CAD-4521', 'CAR', 'AUTOMATIC', 14500.00, 
   'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80', 'AVAILABLE', 'Galle Fort', NOW() - INTERVAL '30 days'),

  ('b2222222-2222-2222-2222-222222222222', 'Toyota', 'Aqua S-Grade', 2022, 'SP-BCQ-8902', 'CAR', 'AUTOMATIC', 11500.00, 
   'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80', 'RENTED', 'Matara Central', NOW() - INTERVAL '28 days'),

  ('b3333333-3333-3333-3333-333333333333', 'Honda', 'Vezel RS Hybrid', 2024, 'WP-CBE-1033', 'CAR', 'AUTOMATIC', 17500.00, 
   'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80', 'AVAILABLE', 'Mirissa Beach', NOW() - INTERVAL '25 days'),

  ('b4444444-4444-4444-4444-444444444444', 'Suzuki', 'Wagon R FX', 2022, 'SP-WP-9921', 'CAR', 'AUTOMATIC', 9500.00, 
   'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', 'AVAILABLE', 'Tangalle Bay', NOW() - INTERVAL '22 days'),

  ('b5555555-5555-5555-5555-555555555555', 'Nissan', 'Leaf EV', 2023, 'WP-KT-6712', 'CAR', 'AUTOMATIC', 12500.00, 
   'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80', 'AVAILABLE', 'Galle Fort', NOW() - INTERVAL '20 days'),

  ('b6666666-6666-6666-6666-666666666666', 'Hyundai', 'Grand i10 Prime', 2021, 'SP-BAC-5140', 'CAR', 'MANUAL', 8800.00, 
   'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', 'MAINTENANCE', 'Matara Central', NOW() - INTERVAL '18 days'),

  -- 2. Scooters
  ('c1111111-1111-1111-1111-111111111111', 'Honda', 'Dio 110 Deluxe', 2024, 'SP-BCU-7201', 'SCOOTER', 'AUTOMATIC', 4500.00, 
   'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80', 'AVAILABLE', 'Mirissa Beach', NOW() - INTERVAL '17 days'),

  ('c2222222-2222-2222-2222-222222222222', 'Yamaha', 'RayZR 125 Fi-Hybrid', 2023, 'SP-BCT-4190', 'SCOOTER', 'AUTOMATIC', 5000.00, 
   'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80', 'RENTED', 'Weligama Surf Point', NOW() - INTERVAL '15 days'),

  ('c3333333-3333-3333-3333-333333333333', 'TVS', 'NTORQ 125 Race Edition', 2023, 'SP-BCW-3388', 'SCOOTER', 'AUTOMATIC', 5500.00, 
   'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80', 'AVAILABLE', 'Galle Fort', NOW() - INTERVAL '14 days'),

  ('c4444444-4444-4444-4444-444444444444', 'Vespa', 'Primavera 150', 2022, 'WP-BCZ-1192', 'SCOOTER', 'AUTOMATIC', 8000.00, 
   'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80', 'AVAILABLE', 'Mirissa Beach', NOW() - INTERVAL '12 days'),

  ('c5555555-5555-5555-5555-555555555555', 'Honda', 'PCX 160 ABS', 2024, 'WP-BDD-8820', 'SCOOTER', 'AUTOMATIC', 8500.00, 
   'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80', 'AVAILABLE', 'Matara Central', NOW() - INTERVAL '10 days'),

  -- 3. Vans
  ('d1111111-1111-1111-1111-111111111111', 'Toyota', 'HiAce KDH 200 Super GL', 2023, 'WP-ND-8941', 'VAN', 'AUTOMATIC', 24000.00, 
   'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80', 'AVAILABLE', 'Galle Fort', NOW() - INTERVAL '25 days'),

  ('d2222222-2222-2222-2222-222222222222', 'Nissan', 'NV350 Caravan Luxury', 2022, 'SP-NA-6219', 'VAN', 'MANUAL', 21000.00, 
   'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', 'RENTED', 'Matara Central', NOW() - INTERVAL '20 days'),

  ('d3333333-3333-3333-3333-333333333333', 'Toyota', 'Noah Hybrid Executive', 2024, 'WP-CBF-3004', 'VAN', 'AUTOMATIC', 26000.00, 
   'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', 'AVAILABLE', 'Mirissa Beach', NOW() - INTERVAL '15 days'),

  ('d4444444-4444-4444-4444-444444444444', 'Suzuki', 'Every Turbo Join', 2023, 'SP-DA-4812', 'VAN', 'AUTOMATIC', 12800.00, 
   'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80', 'MAINTENANCE', 'Tangalle Bay', NOW() - INTERVAL '10 days')
ON CONFLICT (registration_number) DO NOTHING;

-- Seed Bookings
INSERT INTO bookings (id, customer_id, vehicle_id, start_date, end_date, total_cost, status, created_at)
VALUES
  -- Completed bookings in the past
  ('e1111111-1111-1111-1111-111111111111', 
   'a1111111-1111-1111-1111-111111111111', 
   'b1111111-1111-1111-1111-111111111111', 
   CURRENT_DATE - INTERVAL '14 days', 
   CURRENT_DATE - INTERVAL '10 days', 
   58000.00, 'COMPLETED', NOW() - INTERVAL '18 days'),

  ('e2222222-2222-2222-2222-222222222222', 
   'a2222222-2222-2222-2222-222222222222', 
   'c1111111-1111-1111-1111-111111111111', 
   CURRENT_DATE - INTERVAL '8 days', 
   CURRENT_DATE - INTERVAL '5 days', 
   13500.00, 'COMPLETED', NOW() - INTERVAL '10 days'),

  ('e3333333-3333-3333-3333-333333333333', 
   'a3333333-3333-3333-3333-333333333333', 
   'd1111111-1111-1111-1111-111111111111', 
   CURRENT_DATE - INTERVAL '6 days', 
   CURRENT_DATE - INTERVAL '2 days', 
   96000.00, 'COMPLETED', NOW() - INTERVAL '9 days'),

  -- Active / In-Progress Rented bookings
  ('e4444444-4444-4444-4444-444444444444', 
   '25ab50b7-44b7-4c27-bebe-7a59e9adc5aa', -- Gajindu Yashmika
   'b2222222-2222-2222-2222-222222222222', -- Toyota Aqua
   CURRENT_DATE - INTERVAL '2 days', 
   CURRENT_DATE + INTERVAL '3 days', 
   57500.00, 'CONFIRMED', NOW() - INTERVAL '3 days'),

  ('e5555555-5555-5555-5555-555555555555', 
   'a2222222-2222-2222-2222-222222222222', -- James Tanaka
   'c2222222-2222-2222-2222-222222222222', -- Yamaha RayZR
   CURRENT_DATE - INTERVAL '1 day', 
   CURRENT_DATE + INTERVAL '4 days', 
   25000.00, 'CONFIRMED', NOW() - INTERVAL '2 days'),

  ('e6666666-6666-6666-6666-666666666666', 
   'a4444444-4444-4444-4444-444444444444', -- Kasun Perera
   'd2222222-2222-2222-2222-222222222222', -- Nissan Caravan
   CURRENT_DATE, 
   CURRENT_DATE + INTERVAL '5 days', 
   105000.00, 'CONFIRMED', NOW() - INTERVAL '1 day'),

  -- Upcoming Confirmed booking
  ('e7777777-7777-7777-7777-777777777777', 
   'a1111111-1111-1111-1111-111111111111', -- Sarah Miller
   'b3333333-3333-3333-3333-333333333333', -- Honda Vezel
   CURRENT_DATE + INTERVAL '7 days', 
   CURRENT_DATE + INTERVAL '12 days', 
   87500.00, 'CONFIRMED', NOW() - INTERVAL '12 hours'),

  -- Cancelled booking
  ('e8888888-8888-8888-8888-888888888888', 
   'a3333333-3333-3333-3333-333333333333', 
   'c4444444-4444-4444-4444-444444444444', 
   CURRENT_DATE + INTERVAL '2 days', 
   CURRENT_DATE + INTERVAL '5 days', 
   24000.00, 'CANCELLED', NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;
