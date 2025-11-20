import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET hotel by event_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id is required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Fetch hotel
      const hotelResult = await client.query(
        `SELECT 
          id, event_id, hotel_name, star_rating, image_url, website,
          address_street, city, state, country, pincode, maps_link,
          additional_details, is_active, created_at, updated_at
        FROM app.hotels
        WHERE event_id = $1 AND is_active = TRUE
        LIMIT 1`,
        [eventId]
      );

      if (hotelResult.rows.length === 0) {
        return NextResponse.json({ 
          status: 'success', 
          hotel: null 
        }, { status: 200 });
      }

      const hotel = hotelResult.rows[0];

      // Fetch hotel POCs
      const pocsResult = await client.query(
        `SELECT 
          id, name, country_code, phone, email, poc_for, display_for_members
        FROM app.hotel_pocs
        WHERE hotel_id = $1
        ORDER BY created_at`,
        [hotel.id]
      );

      // Fetch hotel services/amenities
      const servicesResult = await client.query(
        `SELECT service_name
        FROM app.hotel_services
        WHERE hotel_id = $1
        ORDER BY service_name`,
        [hotel.id]
      );

      // Format response
      const hotelData = {
        ...hotel,
        pocs: pocsResult.rows.map(poc => ({
          ...poc,
          phone: poc.country_code ? `${poc.country_code}${poc.phone}` : poc.phone,
        })),
        amenities: servicesResult.rows.map(s => s.service_name),
      };

      return NextResponse.json({ 
        status: 'success', 
        hotel: hotelData 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch hotel:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch hotel', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create or update hotel
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized',
      }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(executiveSession);
    } catch (e) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - Invalid session',
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      event_id,
      hotel_name,
      star_rating,
      image_url,
      website,
      address_street,
      city,
      state,
      country,
      pincode,
      maps_link,
      additional_details,
      pocs = [],
      amenities = [],
    } = body;

    if (!event_id || !hotel_name) {
      return NextResponse.json({
        status: 'error',
        message: 'event_id and hotel_name are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if hotel exists for this event
      const existingResult = await client.query(
        `SELECT id FROM app.hotels 
         WHERE event_id = $1 AND is_active = TRUE
         LIMIT 1`,
        [event_id]
      );

      let hotelId;
      let result;

      if (existingResult.rows.length > 0) {
        // Update existing hotel
        hotelId = existingResult.rows[0].id;
        result = await client.query(
          `UPDATE app.hotels SET
            hotel_name = $1,
            star_rating = $2,
            image_url = $3,
            website = $4,
            address_street = $5,
            city = $6,
            state = $7,
            country = $8,
            pincode = $9,
            maps_link = $10,
            additional_details = $11,
            updated_at = NOW()
          WHERE id = $12 AND is_active = TRUE
          RETURNING *`,
          [
            hotel_name,
            star_rating || 3,
            image_url || null,
            website || null,
            address_street || null,
            city || null,
            state || null,
            country || 'IN',
            pincode || null,
            maps_link || null,
            additional_details || null,
            hotelId,
          ]
        );
      } else {
        // Create new hotel
        result = await client.query(
          `INSERT INTO app.hotels (
            event_id, hotel_name, star_rating, image_url, website,
            address_street, city, state, country, pincode, maps_link,
            additional_details, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            event_id,
            hotel_name,
            star_rating || 3,
            image_url || null,
            website || null,
            address_street || null,
            city || null,
            state || null,
            country || 'IN',
            pincode || null,
            maps_link || null,
            additional_details || null,
            user.id,
          ]
        );
        hotelId = result.rows[0].id;
      }

      // Delete existing POCs
      await client.query(
        `DELETE FROM app.hotel_pocs WHERE hotel_id = $1`,
        [hotelId]
      );

      // Insert new POCs
      for (const poc of pocs) {
        if (poc.name && poc.phone && poc.email) {
          // Parse phone number if it includes country code
          let phoneNumber = poc.phone;
          let countryCode = poc.country_code || '+91';
          
          // If phone starts with country code, extract it
          if (phoneNumber.startsWith('+')) {
            const match = phoneNumber.match(/^(\+\d{1,3})(.+)$/);
            if (match) {
              countryCode = match[1];
              phoneNumber = match[2];
            }
          }

          await client.query(
            `INSERT INTO app.hotel_pocs (
              hotel_id, name, country_code, phone, email, poc_for, display_for_members
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              hotelId,
              poc.name,
              countryCode,
              phoneNumber,
              poc.email,
              poc.poc_for || null,
              poc.display_for_members || false,
            ]
          );
        }
      }

      // Delete existing services
      await client.query(
        `DELETE FROM app.hotel_services WHERE hotel_id = $1`,
        [hotelId]
      );

      // Insert new services
      for (const service of amenities) {
        if (service && service.trim() !== '') {
          await client.query(
            `INSERT INTO app.hotel_services (hotel_id, service_name)
             VALUES ($1, $2)`,
            [hotelId, service.trim()]
          );
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        status: 'success', 
        message: 'Hotel saved successfully', 
        hotel: result.rows[0] 
      }, { status: 200 });
      
    } catch (dbError: any) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to save hotel:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to save hotel', 
      error: error.message 
    }, { status: 500 });
  }
}
