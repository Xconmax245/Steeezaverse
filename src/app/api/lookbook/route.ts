import { NextResponse } from 'next/server';
import { getPublishedLookbook } from '@/lib/lookbook';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await getPublishedLookbook();
    return NextResponse.json(
      { success: true, images },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}