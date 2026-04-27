/**
 * Emergency Contacts API
 * Manages emergency contacts for family alert system
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all emergency contacts
export async function GET() {
  try {
    const contacts = await db.emergencyContact.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
      include: {
        _count: { select: { alerts: true } }
      }
    });
    
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST - Create new emergency contact
export async function POST(req: NextRequest) {
  try {
    const { name, phone, platform = 'whatsapp', relationship, priority = 1 } = await req.json();
    
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    const contact = await db.emergencyContact.create({
      data: {
        name,
        phone: phone.replace(/\s+/g, ''), // Remove spaces
        platform,
        relationship,
        priority,
      }
    });
    
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to create contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// PUT - Update emergency contact
export async function PUT(req: NextRequest) {
  try {
    const { id, name, phone, platform, relationship, priority, isActive } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }
    
    const contact = await db.emergencyContact.update({
      where: { id },
      data: {
        name,
        phone: phone?.replace(/\s+/g, ''),
        platform,
        relationship,
        priority,
        isActive,
      }
    });
    
    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Failed to update contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE - Delete emergency contact
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }
    
    // Soft delete - set isActive to false
    await db.emergencyContact.update({
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
