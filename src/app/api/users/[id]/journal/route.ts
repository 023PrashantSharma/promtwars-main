/* GET/POST/DELETE /api/users/:id/journal */

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
    const user = await User.findById(id, 'journalEntries').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user.journalEntries || []);
  } catch (error) {
    console.error('Failed to get journal entries:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
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

    const entries = user.journalEntries as unknown as Array<{ id: string } & Record<string, unknown>>;
    const existingIdx = entries.findIndex((e) => e.id === entry.id);

    if (existingIdx >= 0) {
      entries[existingIdx] = entry;
    } else {
      entries.unshift(entry);
    }

    await user.save();
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to save journal entry:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { entryId } = await request.json();

    if (id && id.startsWith('local_')) {
      return NextResponse.json({ success: true });
    }

    await connectDB();

    await User.findByIdAndUpdate(id, {
      $pull: { journalEntries: { id: entryId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
