
'use client';

import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { SidebarMenuButton } from './ui/sidebar';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/login'); // Or your desired page after logout
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <SidebarMenuButton tooltip="Logout" className="font-headline" onClick={handleLogout}>
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}
