import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

// GET single partner with POCs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await pool.connect();

    try {
      // Get partner
      const partnerResult = await client.query(
        `SELECT 
          id, company_name, industry_type, company_size, logo_url, website,
          address_lane, city, state, country, pincode, tax_number,
          is_active, created_at, updated_at, created_by
        FROM app.partners 
        WHERE id = $1 AND is_active = true`,
        [id]
      );

      if (partnerResult.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Partner not found',
        }, { status: 404 });
      }

      const partner = partnerResult.rows[0];

      // Get POCs for this partner
      const pocsResult = await client.query(
        `SELECT 
          id, partner_id, name, email, country_code, phone, designation, is_primary,
          created_at, updated_at
        FROM app.partner_pocs
        WHERE partner_id = $1
        ORDER BY is_primary DESC, name ASC`,
        [id]
      );

      return NextResponse.json({
        status: 'success',
        partner: {
          ...partner,
          pocs: pocsResult.rows,
        },
      }, { status: 200 });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch partner:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch partner',
      error: error.message,
    }, { status: 500 });
  }
}

// PUT update partner and POCs
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

      // Update partner
      const partnerResult = await client.query(
        `UPDATE app.partners SET
          company_name = $1,
          industry_type = $2,
          company_size = $3,
          logo_url = $4,
          website = $5,
          address_lane = $6,
          city = $7,
          state = $8,
          country = $9,
          pincode = $10,
          tax_number = $11,
          updated_at = NOW()
        WHERE id = $12 AND is_active = true
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
          id,
        ]
      );

      if (partnerResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          status: 'error',
          message: 'Partner not found',
        }, { status: 404 });
      }

      const partner = partnerResult.rows[0];

      // Delete existing POCs
      await client.query(
        `DELETE FROM app.partner_pocs WHERE partner_id = $1`,
        [id]
      );

      // Insert new POCs
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
        message: 'Partner updated successfully',
        partner: {
          ...partner,
          pocs: insertedPocs,
        },
      }, { status: 200 });

    } catch (dbError: any) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Failed to update partner:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update partner',
      error: error.message,
    }, { status: 500 });
  }
}

// DELETE soft delete partner (set is_active = false)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        `UPDATE app.partners 
        SET is_active = false, updated_at = NOW() 
        WHERE id = $1 AND is_active = true
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Partner not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        status: 'success',
        message: 'Partner deleted successfully',
      }, { status: 200 });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to delete partner:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to delete partner',
      error: error.message,
    }, { status: 500 });
  }
}

