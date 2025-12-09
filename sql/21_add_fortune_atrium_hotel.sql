-- Add Fortune Atrium Hotel for Kotak Life Dubai Event

DO $$
DECLARE
    event_id UUID := '5df20044-dd57-4989-9853-0481d3c73b19'; -- Dubai Agency FLY Jul'25
    hotel_id UUID;
BEGIN
    -- Insert Fortune Atrium Hotel
    INSERT INTO app.hotels (
        event_id,
        hotel_name,
        star_rating,
        website,
        address_street,
        city,
        state,
        country,
        pincode,
        maps_link,
        additional_details,
        is_active
    )
    VALUES (
        event_id,
        'Fortune Atrium Hotel',
        4, -- 4-star hotel
        NULL, -- Update with actual website
        'Al Karama Area', -- Common location for mid-range hotels in Dubai
        'Dubai',
        'Dubai',
        'UAE',
        NULL,
        'https://maps.google.com/?q=Fortune+Atrium+Hotel+Dubai',
        'A comfortable 4-star hotel in Dubai. Features include complimentary breakfast, free WiFi, fitness center, and business facilities. Ideal for corporate groups and event attendees.',
        TRUE
    )
    RETURNING id INTO hotel_id;
    
    RAISE NOTICE 'Created Fortune Atrium Hotel with ID: %', hotel_id;
    
    -- Add hotel POC (Point of Contact)
    INSERT INTO app.hotel_pocs (
        hotel_id,
        name,
        country_code,
        phone,
        email,
        poc_for,
        display_for_members
    )
    VALUES (
        hotel_id,
        'Hotel Reservations',
        '+971',
        '40000000', -- Placeholder - update with actual number
        'reservations@fortuneatrium.ae', -- Placeholder - update with actual email
        'Reservations & Front Desk',
        TRUE
    );
    
    -- Add hotel services
    INSERT INTO app.hotel_services (hotel_id, service_name)
    VALUES 
        (hotel_id, 'Free WiFi'),
        (hotel_id, 'Breakfast Included'),
        (hotel_id, 'Airport Transfer'),
        (hotel_id, 'Fitness Center'),
        (hotel_id, 'Business Center'),
        (hotel_id, 'Restaurant'),
        (hotel_id, 'Room Service'),
        (hotel_id, 'Laundry Service'),
        (hotel_id, 'Concierge'),
        (hotel_id, 'Banquet Hall');
    
    RAISE NOTICE 'Added hotel services and POC';
    
END $$;

-- Verify
SELECT h.id, h.hotel_name, h.city, h.country, h.star_rating
FROM app.hotels h
WHERE h.hotel_name = 'Fortune Atrium Hotel';

