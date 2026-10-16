import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { uploadImageFile, ALLOWED_IMAGE_BUCKETS } from '@/lib/uploads';

// Raise the body-size limit so it comfortably exceeds the 5 MB image cap.
// Next.js defaults to 4 MB, which caused "Request Entity Too Large" 413 errors
// that came back as plain text and broke JSON.parse in the client.
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

// Unified admin image upload. Shared by the Product + Lookbook admin flows.
//   POST /api/admin/upload?bucket=product-images   (FormData field "file")
// Bucket defaults to 'product-images'; must be in ALLOWED_IMAGE_BUCKETS.
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get('bucket') ?? 'product-images';

  if (!ALLOWED_IMAGE_BUCKETS.has(bucket)) {
    return NextResponse.json(
      { success: false, error: `Unknown bucket. Allowed: ${Array.from(ALLOWED_IMAGE_BUCKETS).join(', ')}` },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'No file provided (expected FormData field "file")' },
      { status: 400 }
    );
  }

  try {
    const { url } = await uploadImageFile(file, bucket);
    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}