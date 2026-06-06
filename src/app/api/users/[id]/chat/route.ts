/* GET/POST /api/users/:id/chat */

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
    const user = await User.findById(id, 'chatHistory').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user.chatHistory || []);
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
    const message = await request.json();

    if (id && id.startsWith('local_')) {
      return NextResponse.json(message, { status: 201 });
    }

    await connectDB();

    await User.findByIdAndUpdate(id, {
      $push: {
        chatHistory: {
          $each: [message],
          $slice: -100, // keep last 100
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (id && id.startsWith('local_')) {
      return NextResponse.json({ success: true });
    }

    await connectDB();
    await User.findByIdAndUpdate(id, { chatHistory: [] });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
