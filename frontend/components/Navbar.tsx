'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, clearUser } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TG</span>
          </div>
          <span className="font-bold text-xl text-gray-900">TradeGrid Africa</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/marketplace" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
            Marketplace
          </Link>
          {user && (
            <>
              {user.role === 'SUPPLIER' && (
                <Link href="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/orders" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                Orders
              </Link>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden md:block">
                Hi, {user.name.split(' ')[0]}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
