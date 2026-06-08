import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { getUser } from '../lib/firestore';
import { functions, webAuth } from '../lib/firebase';
import { useAppStore } from '../store/appStore';

// Watches Firebase auth state and syncs to Zustand store.
// Also signs the web SDK into Firebase Auth so Firestore security rules work.
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
          // Sync web SDK auth so Firestore rules see request.auth
          const idToken = await firebaseUser.getIdToken();
          const getToken = httpsCallable<{ idToken: string }, { token: string }>(
            functions,
            'generateCustomToken'
          );
          const { data } = await getToken({ idToken });
          await signInWithCustomToken(webAuth, data.token);
          console.log('[auth] web SDK signed in for uid:', firebaseUser.uid);

          const profile = await getUser(firebaseUser.uid);
          setUser(profile ? { ...fallback, ...profile } : fallback);
        } catch (err) {
          console.error('[auth] web SDK sign-in failed:', err);
          setUser(fallback);
        }
      } else {
        await signOut(webAuth).catch(() => {});
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
}
