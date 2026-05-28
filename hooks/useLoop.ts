import { useEffect, useState } from 'react';
import { subscribeLoop, subscribeQueue } from '../lib/firestore';
import type { Loop } from '../types';

interface QueueItem {
  userId: string;
  name: string;
  avatar: string;
}

export function useLoop(loopId: string) {
  const [loop, setLoop] = useState<Loop | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const unsubLoop = subscribeLoop(loopId, setLoop);
    const unsubQueue = subscribeQueue(loopId, setQueue);
    return () => {
      unsubLoop();
      unsubQueue();
    };
  }, [loopId]);

  return { loop, queue };
}
