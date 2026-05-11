'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Feather } from 'lucide-react';
import { useOwner } from '@/context/OwnerContext';
import { logout } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function Navbar() {
  const { owner, isIdentified, clear } = useOwner();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    clear();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-green-700">
        <Feather className="w-5 h-5" />
        ตีก๊วน
      </Link>

      {isIdentified && (
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/squads"
            className={`hover:text-green-700 ${pathname.startsWith('/squads') ? 'text-green-700 font-semibold' : 'text-gray-600'}`}
          >
            ก๊วนของฉัน
          </Link>
          <Link
            href="/reports"
            className={`hover:text-green-700 ${pathname.startsWith('/reports') ? 'text-green-700 font-semibold' : 'text-gray-600'}`}
          >
            สรุปรายเดือน
          </Link>
          <Link
            href="/settings"
            className={`hover:text-green-700 ${pathname.startsWith('/settings') ? 'text-green-700 font-semibold' : 'text-gray-600'}`}
          >
            ตั้งค่า
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="ออกจากระบบ"
          >
            ออก
          </button>
        </div>
      )}
    </nav>
  );
}
