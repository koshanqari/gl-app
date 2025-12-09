import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkPermission } from '@/lib/auth-helpers';
import { sendNotificationViaN8N } from '@/lib/n8n-otp-service';

// GET all members or members by event_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const email = searchParams.get('email');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          id, event_id, employee_id, name, email, country_code, phone,
          kyc_document_type, kyc_document_number, kyc_document_url,
          is_active, created_at, updated_at
        FROM app.members 
        WHERE is_active = TRUE
      `;
      
      const params: any[] = [];
      let paramCount = 0;
      
      if (eventId) {
        paramCount++;
        query += ` AND event_id = $${paramCount}`;
        params.push(eventId);
      }
      
      if (email) {
        paramCount++;
        query += ` AND email = $${paramCount}`;
        params.push(email);
      }
      
      query += ` ORDER BY employee_id ASC`;

      const result = await client.query(query, params);

      return NextResponse.json({ 
        status: 'success', 
        members: result.rows 
      }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch members', 
      error: error.message 
    }, { status: 500 });
  }
}

// POST create new member
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
      kyc_document_type,
      kyc_document_number,
      kyc_document_url,
    } = body;

    // Check authentication and permission
    const { allowed, auth } = await checkPermission('members', event_id);
    if (!allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - No session found or insufficient permissions',
      }, { status: 401 });
    }

    if (!event_id || !employee_id || !name || !email || !phone) {
      return NextResponse.json({
        status: 'error',
        message: 'Event ID, Employee ID, Name, Email, and Phone are required',
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get event and partner details for notification
      const eventData = await client.query(
        `SELECT 
          e.id, e.event_name, e.send_registration_notification,
          p.company_name as client_name
        FROM app.events e
        LEFT JOIN app.partners p ON e.partner_id = p.id
        WHERE e.id = $1 AND e.is_active = TRUE`,
        [event_id]
      );

      const eventInfo = eventData.rows[0] || { event_name: 'Unknown Event', client_name: 'Unknown Client', send_registration_notification: true };

      const result = await client.query(
        `INSERT INTO app.members 
          (event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, event_id, employee_id, name, email, country_code, phone, kyc_document_type, kyc_document_number, kyc_document_url, is_active, created_at, updated_at`,
        [
          event_id,
          employee_id,
          name,
          email,
          country_code || '+91',
          phone,
          kyc_document_type || null,
          kyc_document_number || null,
          kyc_document_url || null,
        ]
      );

      // Send registration notification to n8n (non-blocking) if enabled for this event
      const useN8N = process.env.USE_N8N_NOTIFICATIONS !== 'false' && process.env.N8N_NOTIFICATION_WEBHOOK_URL;
      const sendNotification = eventInfo.send_registration_notification !== false; // Default to true
      if (useN8N && sendNotification) {
        sendNotificationViaN8N({
          name: name,
          phone: phone,
          countryCode: country_code || '+91',
          email: email,
          type: 'registration',
          data: {
            client_name: eventInfo.client_name || 'Unknown Client',
            event_name: eventInfo.event_name || 'Unknown Event',
            employee_id: employee_id,
          },
        }).catch((error) => {
          console.error('[Member Creation] Failed to send n8n notification:', error);
          // Don't fail member creation if notification fails
        });
      }

      return NextResponse.json({ 
        status: 'success', 
        message: 'Member created successfully', 
        member: result.rows[0] 
      }, { status: 201 });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Failed to create member:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Employee ID already exists for this event', 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to create member', 
      error: error.message 
    }, { status: 500 });
  }
}

