/* GET/POST /api/users/:id/focus */

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
    const user = await User.findById(id, 'focusSessions').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user.focusSessions || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await request.json();

    if (id && id.startsWith('local_')) {
      return NextResponse.json(session, { status: 201 });
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sessions = user.focusSessions as unknown as Array<{ id: string } & Record<string, unknown>>;
    const existingIdx = sessions.findIndex((s) => s.id === session.id);

    if (existingIdx >= 0) {
      sessions[existingIdx] = session;
    } else {
      sessions.unshift(session);
    }

    await user.save();
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
