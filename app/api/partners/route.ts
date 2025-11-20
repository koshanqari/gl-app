import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET all partners with their POCs
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Get all active partners
      const partnersResult = await client.query(
        `SELECT 
          id, company_name, industry_type, company_size, logo_url, website,
          address_lane, city, state, country, pincode, tax_number,
          is_active, created_at, updated_at, created_by
        FROM app.partners 
        WHERE is_active = true
        ORDER BY company_name ASC`
      );

      // Get all POCs for these partners
      const pocsResult = await client.query(
        `SELECT 
          id, partner_id, name, email, country_code, phone, designation, is_primary,
          created_at, updated_at
        FROM app.partner_pocs
        ORDER BY partner_id, is_primary DESC, name ASC`
      );

      // Group POCs by partner_id
      const pocsByPartner: { [key: string]: any[] } = {};
      pocsResult.rows.forEach((poc) => {
        if (!pocsByPartner[poc.partner_id]) {
          pocsByPartner[poc.partner_id] = [];
        }
        pocsByPartner[poc.partner_id].push(poc);
      });

      // Combine partners with their POCs
      const partnersWithPocs = partnersResult.rows.map((partner) => ({
        ...partner,
        pocs: pocsByPartner[partner.id] || [],
      }));

      return NextResponse.json({
        status: 'success',
        partners: partnersWithPocs,
      }, { status: 200 });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch partners:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch partners',
      error: error.message,
    }, { status: 500 });
  }
}

// POST create new partner with POCs
export async function POST(request: Request) {
  try {
    // Get executive session from cookies (server-side)
    const cookieStore = await cookies();
    const executiveSession = cookieStore.get('executive-session')?.value;
    
    if (!executiveSession) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found',
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
      company_name,
      industry_type,
      company_size,
      logo_url,
      website,
      address_lane,
      city,
      state,
      country,
      pincode,
      tax_number,
      pocs = [],
    } = body;

    if (!company_name) {
      return NextResponse.json({
        status: 'error',
        message: 'Company name is required',
      }, { status: 400 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert partner
      const partnerResult = await client.query(
        `INSERT INTO app.partners (
          company_name, industry_type, company_size, logo_url, website,
          address_lane, city, state, country, pincode, tax_number,
          is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
        RETURNING *`,
        [
          company_name,
          industry_type || null,
          company_size || null,
          logo_url || null,
          website || null,
          address_lane || null,
          city || null,
          state || null,
          country || null,
          pincode || null,
          tax_number || null,
          user.id,
        ]
      );

      const partner = partnerResult.rows[0];

      // Insert POCs if provided
      const insertedPocs = [];
      for (const poc of pocs) {
        const pocResult = await client.query(
          `INSERT INTO app.partner_pocs (
            partner_id, name, email, country_code, phone, designation, is_primary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            partner.id,
            poc.name,
            poc.email,
            poc.country_code || '+91',
            poc.phone || null,
            poc.designation || null,
            poc.is_primary || false,
          ]
        );
        insertedPocs.push(pocResult.rows[0]);
      }

      await client.query('COMMIT');

      return NextResponse.json({
        status: 'success',
        message: 'Partner created successfully',
        partner: {
          ...partner,
          pocs: insertedPocs,
        },
      }, { status: 201 });

    } catch (dbError: any) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Failed to create partner:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create partner',
      error: error.message,
    }, { status: 500 });
  }
}

