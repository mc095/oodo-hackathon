
'use client';

import { useAuth } from '@/lib/mysql-index';
import { useRouter } from 'next/navigation';
import { SidebarMenuButton } from './ui/sidebar';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Or your desired page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SidebarMenuButton tooltip="Logout" className="font-headline" onClick={handleLogout}>
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}
