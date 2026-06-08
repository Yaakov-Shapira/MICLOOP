import { Timestamp } from 'firebase/firestore';

export type LoopStatus = 'live' | 'ended' | 'scheduled';
export type UserRole = 'host' | 'speaker' | 'listener';
export type VerifyStatus = 'none' | 'pending' | 'verified';

export interface AppUser {
  uid: string;
  name: string;
  phone: string;
  avatar: string; // emoji
  avatarUrl?: string;
  verifyStatus: VerifyStatus;
  isAdmin?: boolean;
  fcmToken?: string;
  createdAt: Timestamp;
}

export interface Speaker {
  userId: string;
  name: string;
  avatar: string;
  muted: boolean;
}

export interface Loop {
  id: string;
  title: string;
  status: LoopStatus;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  livekitRoomName: string;
  recordingUrl?: string;
  listenerCount: number;
  speakers: Speaker[];
  startTime: Timestamp;
  endTime?: Timestamp;
  scheduledFor?: Timestamp;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  text: string;
  createdAt: Timestamp;
}

export interface Rating {
  userId: string;
  stars: number;
  createdAt: Timestamp;
}

export interface HostRequest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  topic: string;
  preferredTime: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface LocalRecording {
  id: string;
  name: string;
  date: string;
  uri: string;
  duration: number;
  loopId?: string;
  loopTitle?: string;
}
