import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Loop, AppUser, Message, HostRequest } from '../types';

// ─── Loops ────────────────────────────────────────────────────────────────────

export function subscribeLiveLoops(cb: (loops: Loop[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'loops'),
    where('status', '==', 'live'),
    orderBy('startTime', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Loop)));
  });
}

export function subscribePastLoops(cb: (loops: Loop[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'loops'),
    where('status', '==', 'ended'),
    orderBy('endTime', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Loop)));
  });
}

export function subscribeScheduledLoops(cb: (loops: Loop[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'loops'),
    where('status', '==', 'scheduled'),
    orderBy('scheduledFor', 'asc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Loop)));
  });
}

export function subscribeLoop(loopId: string, cb: (loop: Loop | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'loops', loopId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Loop) : null);
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function subscribeMessages(loopId: string, cb: (msgs: Message[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'loops', loopId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function sendMessage(loopId: string, msg: Omit<Message, 'id' | 'createdAt'>) {
  const ref = doc(collection(db, 'loops', loopId, 'messages'));
  await setDoc(ref, { ...msg, createdAt: serverTimestamp() });
}

// ─── Raise Hand Queue ────────────────────────────────────────────────────────

export function subscribeQueue(
  loopId: string,
  cb: (queue: { userId: string; name: string; avatar: string }[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'loops', loopId, 'queue'),
    orderBy('raisedAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ userId: d.id, ...d.data() } as any)));
  });
}

export async function raiseHand(
  loopId: string,
  user: { userId: string; name: string; avatar: string }
) {
  await setDoc(doc(db, 'loops', loopId, 'queue', user.userId), {
    name: user.name,
    avatar: user.avatar,
    raisedAt: serverTimestamp(),
  });
}

export async function lowerHand(loopId: string, userId: string) {
  await deleteDoc(doc(db, 'loops', loopId, 'queue', userId));
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export async function likeLoop(userId: string, loopId: string) {
  await setDoc(doc(db, 'userLikes', userId, 'liked', loopId), {
    loopId,
    createdAt: serverTimestamp(),
  });
}

export async function unlikeLoop(userId: string, loopId: string) {
  await deleteDoc(doc(db, 'userLikes', userId, 'liked', loopId));
}

export function subscribeLikedLoops(userId: string, cb: (ids: Set<string>) => void): Unsubscribe {
  return onSnapshot(collection(db, 'userLikes', userId, 'liked'), (snap) => {
    cb(new Set(snap.docs.map((d) => d.id)));
  });
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export async function rateLoop(loopId: string, userId: string, stars: number) {
  await setDoc(doc(db, 'loops', loopId, 'ratings', userId), {
    stars,
    createdAt: serverTimestamp(),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as AppUser) : null;
}

export async function upsertUser(uid: string, data: Partial<AppUser>) {
  await setDoc(doc(db, 'users', uid), { ...data, uid }, { merge: true });
}

// ─── Host Requests ───────────────────────────────────────────────────────────

export async function submitHostRequest(request: Omit<HostRequest, 'id' | 'createdAt' | 'status'>) {
  const ref = doc(collection(db, 'hostRequests'));
  await setDoc(ref, { ...request, status: 'pending', createdAt: serverTimestamp() });
}

export function subscribeHostRequests(cb: (requests: HostRequest[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'hostRequests'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as HostRequest)));
  });
}

export async function updateHostRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected'
) {
  await updateDoc(doc(db, 'hostRequests', requestId), { status });
}
