/* GET/PATCH /api/users/:id */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/user';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fast-path bypass for offline simulated users
    if (id && id.startsWith('local_')) {
      return NextResponse.json({
        _id: id,
        moodEntries: [],
        journalEntries: [],
        focusSessions: [],
        chatHistory: [],
      });
    }

    await connectDB();
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    if (id && id.startsWith('local_')) {
      return NextResponse.json({ success: true, updates });
    }

    await connectDB();

    // Only allow safe updates
    const allowed = ['name', 'selectedExam', 'customExamDate', 'theme'];
    const safeUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    const user = await User.findByIdAndUpdate(id, safeUpdates, { new: true }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
