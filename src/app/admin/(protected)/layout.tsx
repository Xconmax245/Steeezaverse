import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/admin/login');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}