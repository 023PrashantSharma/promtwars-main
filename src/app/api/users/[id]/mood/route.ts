/* GET/POST /api/users/:id/mood */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/user';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (id && id.startsWith('local_')) {
      return NextResponse.json([]);
    }

    await connectDB();
    const user = await User.findById(id, 'moodEntries').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user.moodEntries || []);
  } catch (error) {
    console.error('Failed to get mood entries:', error);
    return NextResponse.json({ error: 'Failed to get mood entries' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await request.json();

    if (id && id.startsWith('local_')) {
      return NextResponse.json(entry, { status: 201 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existingIdx = (user.moodEntries as unknown as Array<{ date: string }>)
      .findIndex((e) => e.date === entry.date);

    if (existingIdx >= 0) {
      (user.moodEntries as unknown as Array<Record<string, unknown>>)[existingIdx] = entry;
    } else {
      (user.moodEntries as unknown as Array<Record<string, unknown>>).unshift(entry);
    }

    await user.save();
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to save mood entry:', error);
    return NextResponse.json({ error: 'Failed to save mood entry' }, { status: 500 });
  }
}
