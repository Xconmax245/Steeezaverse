import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    return NextResponse.json(
      { success: true, products },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}