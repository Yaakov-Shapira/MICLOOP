import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { getUser, upsertUser } from '../lib/firestore';
import { useAppStore } from '../store/appStore';

// Watches Firebase auth state and syncs to Zustand store.
export function useFirebaseAuth() {
  const { setUser, setLoading } = useAppStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const fallback = {
          uid: firebaseUser.uid,
          name: '',
          phone: firebaseUser.phoneNumber ?? '',
          avatar: '🎙️',
          verifyStatus: 'none' as const,
          createdAt: null as any,
        };
        try {
          const profile = await getUser(firebaseUser.uid);
          setUser(profile ?? fallback);
        } catch {
          setUser(fallback);
        }
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
}
