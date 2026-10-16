import NotificationsClient from './NotificationsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | Steezaverse',
  description: 'Your Steezaverse updates, order tracking alerts, and announcements.',
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 lg:px-12 flex justify-center">
      <div className="max-w-3xl w-full">
        <NotificationsClient />
      </div>
    </div>
  );
}
