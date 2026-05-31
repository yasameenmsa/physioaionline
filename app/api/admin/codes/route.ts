import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Voucher from '@/models/Voucher';
import crypto from 'crypto';

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const codes = await Voucher.find({}).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ data: codes });
  } catch (error) {
    console.error('Error fetching codes:', error);
    return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, durationDays, maxUses, count, expiresAt } = body;

    if (!type || !['trial', 'premium'].includes(type)) {
      return NextResponse.json({ error: 'Type must be "trial" or "premium"' }, { status: 400 });
    }

    if (type === 'trial' && (!durationDays || durationDays < 1)) {
      return NextResponse.json({ error: 'Trial codes require durationDays >= 1' }, { status: 400 });
    }

    await connectDB();

    const numCodes = Math.min(Math.max(count || 1, 1), 50);

    const codes = [];
    for (let i = 0; i < numCodes; i++) {
      codes.push({
        code: generateCode(),
        type,
        durationDays: type === 'trial' ? (durationDays || 7) : null,
        maxUses: maxUses || 1,
        usedCount: 0,
        active: true,
        createdBy: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
    }

    const inserted = await Voucher.insertMany(codes);

    return NextResponse.json({
      success: true,
      data: { codes: inserted, count: inserted.length },
      message: `Generated ${inserted.length} ${type} code(s)`,
    });
  } catch (error) {
    console.error('Error generating codes:', error);
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 });
  }
}
