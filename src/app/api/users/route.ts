/* POST /api/users — Create a new user */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const user = await User.create({ name: name.trim() });

    return NextResponse.json({
      userId: user._id.toString(),
      name: user.name,
      createdAt: user.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
