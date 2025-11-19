-- Create hotels table
CREATE TABLE IF NOT EXISTS app.hotels (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  event_id UUID NOT NULL REFERENCES app.events(id) ON DELETE CASCADE,
  
  -- Basic Information
  hotel_name VARCHAR(255) NOT NULL,
  star_rating INTEGER DEFAULT 3 CHECK (star_rating >= 1 AND star_rating <= 5),
  image_url VARCHAR(500),
  website VARCHAR(500),
  
  -- Address
  address_street TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(10) DEFAULT 'IN',
  pincode VARCHAR(20),
  maps_link VARCHAR(500),
  
  -- Additional Details
  additional_details TEXT,
  
  -- Soft Delete
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES app.executives(id)
);

-- One hotel per event constraint (partial unique index)
CREATE UNIQUE INDEX unique_hotel_per_event ON app.hotels(event_id) WHERE is_active = TRUE;

-- Create hotel_pocs table (separate table for multiple POCs)
CREATE TABLE IF NOT EXISTS app.hotel_pocs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES app.hotels(id) ON DELETE CASCADE,
  
  -- POC Information
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(10) DEFAULT '+91' NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  poc_for VARCHAR(255),  -- e.g., "Reservations", "Event Coordination"
  display_for_members BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create hotel_services table (for amenities/services)
CREATE TABLE IF NOT EXISTS app.hotel_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES app.hotels(id) ON DELETE CASCADE,
  
  service_name VARCHAR(255) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_hotels_event_id ON app.hotels(event_id);
CREATE INDEX idx_hotels_is_active ON app.hotels(is_active);
CREATE INDEX idx_hotel_pocs_hotel_id ON app.hotel_pocs(hotel_id);
CREATE INDEX idx_hotel_services_hotel_id ON app.hotel_services(hotel_id);

-- Insert mock data for hotels
INSERT INTO app.hotels (event_id, hotel_name, star_rating, image_url, website, address_street, city, state, country, pincode, maps_link, additional_details, created_by)
VALUES
-- Hotel for Annual Tech Summit 2024
(
  (SELECT id FROM app.events WHERE event_name = 'Annual Tech Summit 2024'),
  'Grand Plaza Hotel',
  5,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://www.grandplazahotel.com',
  '456 Convention Center Drive',
  'Mumbai',
  'Maharashtra',
  'IN',
  '400001',
  'https://maps.google.com/?q=Grand+Plaza+Hotel+Mumbai',
  'Luxury 5-star hotel with state-of-the-art conference facilities, located in the heart of the business district.',
  (SELECT id FROM app.executives WHERE email = 'mailtoqari@gmail.com')
);

-- Insert POCs for Grand Plaza Hotel
INSERT INTO app.hotel_pocs (hotel_id, name, country_code, phone, email, poc_for, display_for_members)
VALUES
(
  (SELECT id FROM app.hotels WHERE hotel_name = 'Grand Plaza Hotel'),
  'Michael Chen',
  '+91',
  '9876543300',
  'reservations@grandplaza.com',
  'Reservations & Check-in',
  TRUE
),
(
  (SELECT id FROM app.hotels WHERE hotel_name = 'Grand Plaza Hotel'),
  'Sarah Williams',
  '+91',
  '9876543301',
  'events@grandplaza.com',
  'Event Coordination',
  FALSE
);

-- Insert services for Grand Plaza Hotel
INSERT INTO app.hotel_services (hotel_id, service_name)
SELECT 
  (SELECT id FROM app.hotels WHERE hotel_name = 'Grand Plaza Hotel'),
  service
FROM (VALUES 
  ('WiFi'),
  ('Swimming Pool'),
  ('Gym'),
  ('Restaurant'),
  ('Bar'),
  ('Conference Rooms'),
  ('Parking'),
  ('Airport Shuttle'),
  ('Spa'),
  ('Room Service'),
  ('24/7 Reception'),
  ('Laundry Service')
) AS services(service);

-- Verify insertion
SELECT 
  h.hotel_name,
  h.star_rating,
  h.city,
  e.event_name,
  COUNT(DISTINCT p.id) as poc_count,
  COUNT(DISTINCT s.id) as service_count
FROM app.hotels h
JOIN app.events e ON h.event_id = e.id
LEFT JOIN app.hotel_pocs p ON h.id = p.hotel_id
LEFT JOIN app.hotel_services s ON h.id = s.hotel_id
WHERE h.is_active = TRUE
GROUP BY h.id, h.hotel_name, h.star_rating, h.city, e.event_name;

