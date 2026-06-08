import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import {
  AccessToken,
  RoomServiceClient,
  VideoGrant,
} from 'livekit-server-sdk';

admin.initializeApp();
const db = admin.firestore();

// ─── Environment ─────────────────────────────────────────────────────────────
// Set these via: firebase functions:secrets:set LIVEKIT_API_KEY
// Or in functions/.env.local for local emulator use
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_HOST = process.env.LIVEKIT_HOST ?? 'https://micloop-t9urxpzr.livekit.cloud';

async function makeLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  grants: VideoGrant
): Promise<string> {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    ttl: '4h',
  });
  token.addGrant(grants);
  return token.toJwt();
}

// ─── generateCustomToken ─────────────────────────────────────────────────────
// Bridges native auth (@react-native-firebase) and web SDK auth (firebase/auth).
// Client passes its native ID token; we verify it and return a custom token
// the web SDK can use to sign in — giving Firestore the auth context it needs.
export const generateCustomToken = onCall(
  { serviceAccount: 'firebase-adminsdk-fbsvc@micloop-6333b.iam.gserviceaccount.com' },
  async (request) => {
  const { idToken } = request.data as { idToken: string };
  if (!idToken) throw new HttpsError('invalid-argument', 'idToken required');
  const decoded = await admin.auth().verifyIdToken(idToken);
  const customToken = await admin.auth().createCustomToken(decoded.uid);
  return { token: customToken };
  }
);

// ─── createLoop ──────────────────────────────────────────────────────────────
// Called by host to start a new live loop.
export const createLoop = onCall(
  { secrets: ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in');
    const { title } = request.data as { title: string };
    if (!title?.trim()) throw new HttpsError('invalid-argument', 'Title required');

    const uid = request.auth.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data() as { name?: string; avatar?: string } | undefined;
    const hostName = userData?.name || 'אורח';
    const hostAvatar = userData?.avatar || '🎙️';

    const loopRef = db.collection('loops').doc();
    const loopId = loopRef.id;
    const roomName = `ml-${loopId}`;

    // Create the LiveKit room
    const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    await roomService.createRoom({ name: roomName, maxParticipants: 200, emptyTimeout: 300 });

    // Persist to Firestore
    await loopRef.set({
      title: title.trim(),
      status: 'live',
      hostId: uid,
      hostName,
      hostAvatar,
      livekitRoomName: roomName,
      recordingUrl: null,
      listenerCount: 0,
      speakers: [{ userId: uid, name: hostName, avatar: hostAvatar, muted: false }],
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      endTime: null,
      scheduledFor: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate host token with full publish rights
    const token = await makeLiveKitToken(roomName, uid, hostName, {
      roomCreate: false,
      roomJoin: true,
      roomAdmin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      room: roomName,
    });

    return { loopId, token };
  }
);

// ─── joinLoop ────────────────────────────────────────────────────────────────
// Called by any user to join as a listener.
export const joinLoop = onCall(
  { secrets: ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in');
    const { loopId } = request.data as { loopId: string };

    const loopSnap = await db.collection('loops').doc(loopId).get();
    if (!loopSnap.exists) throw new HttpsError('not-found', 'Loop not found');
    const loop = loopSnap.data()!;
    if (loop.status !== 'live') throw new HttpsError('failed-precondition', 'Loop is not live');

    const uid = request.auth.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const user = userDoc.data() as { name: string; avatar: string } | undefined;
    const participantName = user?.name ?? 'Guest';

    // Increment listener count
    await db.collection('loops').doc(loopId).update({
      listenerCount: admin.firestore.FieldValue.increment(1),
    });

    // Generate listener token — subscribe only, no publish
    const token = await makeLiveKitToken(loop.livekitRoomName, uid, participantName, {
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
      room: loop.livekitRoomName,
    });

    return { token };
  }
);

// ─── promoteToSpeaker ────────────────────────────────────────────────────────
// Host approves a raised-hand request. Issues a new token with publish rights.
export const promoteToSpeaker = onCall(
  { secrets: ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in');
    const { loopId, userId } = request.data as { loopId: string; userId: string };

    const loopSnap = await db.collection('loops').doc(loopId).get();
    if (!loopSnap.exists) throw new HttpsError('not-found', 'Loop not found');
    const loop = loopSnap.data()!;

    // Only the host can promote
    if (loop.hostId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the host can promote speakers');
    }

    // Get promoted user's info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() as { name?: string; avatar?: string } | undefined;
    if (!userData) throw new HttpsError('not-found', 'User not found');
    const speakerName = userData.name || 'אורח';
    const speakerAvatar = userData.avatar || '🎙️';

    // Update speakers array in Firestore
    await db.collection('loops').doc(loopId).update({
      speakers: admin.firestore.FieldValue.arrayUnion({
        userId,
        name: speakerName,
        avatar: speakerAvatar,
        muted: false,
      }),
    });

    // Generate speaker token with publish rights
    const token = await makeLiveKitToken(loop.livekitRoomName, userId, speakerName, {
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      room: loop.livekitRoomName,
    });

    return { token };
  }
);

// ─── endLoop ─────────────────────────────────────────────────────────────────
// Host ends the loop. Closes the LiveKit room and updates Firestore.
export const endLoop = onCall(
  { secrets: ['LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET'] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in');
    const { loopId } = request.data as { loopId: string };

    const loopSnap = await db.collection('loops').doc(loopId).get();
    if (!loopSnap.exists) throw new HttpsError('not-found', 'Loop not found');
    const loop = loopSnap.data()!;

    if (loop.hostId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the host can end the loop');
    }

    // Update Firestore
    await db.collection('loops').doc(loopId).update({
      status: 'ended',
      endTime: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Close the LiveKit room
    try {
      const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
      await roomService.deleteRoom(loop.livekitRoomName);
    } catch {
      // Room may already be closed — not fatal
    }

    return { success: true };
  }
);

// ─── livekitWebhook ──────────────────────────────────────────────────────────
// Optional: Keeps listenerCount accurate from the server side.
export const livekitWebhook = require('firebase-functions/v2/https').onRequest(
  async (req: any, res: any) => {
    // Verify LiveKit webhook signature and update listenerCount
    // Full implementation: https://docs.livekit.io/home/server/webhooks/
    res.status(200).send('ok');
  }
);
