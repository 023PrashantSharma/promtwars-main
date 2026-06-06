/* POST /api/users — Create a new user */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/user';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let userId = 'local_' + Math.random().toString(36).substring(2, 11);
    const userName = name.trim();
    const userEmail = email && typeof email === 'string' ? email.trim() : null;
    let savedToDB = false;

    try {
      // Attempt to connect and save to MongoDB Atlas
      await connectDB();
      const user = await User.create({
        name: userName,
        email: userEmail,
      });
      userId = user._id.toString();
      savedToDB = true;
    } catch (dbError) {
      console.warn('Database connection failed, falling back to local simulated user:', dbError);
    }

    return NextResponse.json({
      userId,
      name: userName,
      email: userEmail,
      savedToDB,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
