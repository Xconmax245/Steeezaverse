import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { uploadImageFile } from '@/lib/uploads';

// Lookbook-specific upload endpoint (documented contract). Delegates to the
// shared upload helper used by products too — identical validation + storage.
// Returns the public storage URL; the client then POSTs to /api/admin/lookbook.
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'No file provided (expected FormData field "file")' },
      { status: 400 }
    );
  }

  try {
    const { url } = await uploadImageFile(file, 'lookbook');
    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}