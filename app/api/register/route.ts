import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST - Public member registration (no auth required)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_id,
      employee_id,
      name,
      email,
      country_code,
      phone,
    } = body;

    if (!event_id || !employee_id || !name || !email || !phone) {
      return NextResponse.json({
        status: 'error',
        message: 'All fields are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Verify event exists and is active
      const eventCheck = await client.query(
        `SELECT id FROM app.events WHERE id = $1 AND is_active = TRUE`,
        [event_id]
      );

      if (eventCheck.rows.length === 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Event not found or inactive',
        }, { status: 404 });
      }

      // Check if employee_id already exists for this event
      const employeeCheck = await client.query(
        `SELECT id FROM app.members WHERE event_id = $1 AND employee_id = $2 AND is_active = TRUE`,
        [event_id, employee_id]
      );

      if (employeeCheck.rows.length > 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Employee ID already registered. Please login.',
          field: 'employee_id'
        }, { status: 400 });
      }

      // Check if email already exists for this event
      const emailCheck = await client.query(
        `SELECT id FROM app.members WHERE event_id = $1 AND email = $2 AND is_active = TRUE`,
        [event_id, email]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json({
          status: 'error',
          message: 'Email already registered. Please login.',
          field: 'email'
        }, { status: 400 });
      }

      // Create member
      const result = await client.query(
        `INSERT INTO app.members 
          (event_id, employee_id, name, email, country_code, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, event_id, employee_id, name, email, country_code, phone, is_active, created_at, updated_at`,
        [
          event_id,
          employee_id,
          name,
          email,
          country_code || '+91',
          phone,
        ]
      );

      return NextResponse.json({ 
        status: 'success', 
        message: 'Registration successful', 
        member: result.rows[0] 
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to register member:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'This Employee ID is already registered for this event', 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Registration failed. Please try again.', 
      error: error.message 
    }, { status: 500 });
  }
}

