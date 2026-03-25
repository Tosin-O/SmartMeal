'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().admin === true) {
          setIsAuthorized(true);
        } else {
          // User is logged in but NOT an admin. Send them to the regular dashboard.
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error verifying admin status:", error);
        router.push('/dashboard');
      } finally {
        setCheckingAdmin(false);
      }
    };

    verifyAdmin();
  }, [user, authLoading, router]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}