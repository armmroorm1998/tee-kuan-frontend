'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-green-700">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 rotate-45">
          <ellipse cx="28" cy="24" rx="16" ry="18" stroke="#16a34a" strokeWidth="3" fill="#dcfce7" />
          <line x1="13" y1="18" x2="43" y2="18" stroke="#16a34a" strokeWidth="1" />
          <line x1="12" y1="24" x2="44" y2="24" stroke="#16a34a" strokeWidth="1" />
          <line x1="13" y1="30" x2="43" y2="30" stroke="#16a34a" strokeWidth="1" />
          <line x1="20" y1="6" x2="20" y2="42" stroke="#16a34a" strokeWidth="1" />
          <line x1="28" y1="6" x2="28" y2="42" stroke="#16a34a" strokeWidth="1" />
          <line x1="36" y1="6" x2="36" y2="42" stroke="#16a34a" strokeWidth="1" />
          <rect x="25" y="40" width="6" height="18" rx="3" fill="#15803d" />
          <line x1="25" y1="45" x2="31" y2="45" stroke="#bbf7d0" strokeWidth="1.5" />
          <line x1="25" y1="49" x2="31" y2="49" stroke="#bbf7d0" strokeWidth="1.5" />
          <line x1="25" y1="53" x2="31" y2="53" stroke="#bbf7d0" strokeWidth="1.5" />
        </svg>
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
