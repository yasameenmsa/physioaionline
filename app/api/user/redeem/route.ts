import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import User from '@/models/User';
import Voucher from '@/models/Voucher';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    await connectDB();

    const voucher = await Voucher.findOne({ code: code.toUpperCase(), active: true });
    if (!voucher) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
    }

    if (voucher.usedCount >= voucher.maxUses) {
      return NextResponse.json({ error: 'Code has reached maximum uses' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (voucher.type === 'premium') {
      user.tier = 'premium';
      user.subscriptionExpiresAt = undefined;
    } else if (voucher.type === 'trial') {
      const days = voucher.durationDays || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      user.subscriptionExpiresAt = expiresAt;
    }

    voucher.usedCount += 1;
    await voucher.save();
    await user.save();

    return NextResponse.json({
      data: {
        type: voucher.type,
        tier: user.tier,
        subscriptionExpiresAt: user.subscriptionExpiresAt || null,
        message: voucher.type === 'premium'
          ? 'Premium activated successfully!'
          : `Trial activated! You have premium access until ${user.subscriptionExpiresAt?.toLocaleDateString()}`,
      },
    });
  } catch (error) {
    console.error('Error redeeming code:', error);
    return NextResponse.json({ error: 'Failed to redeem code' }, { status: 500 });
  }
}
