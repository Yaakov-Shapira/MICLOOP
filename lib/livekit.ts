import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

interface CreateLoopResult {
  loopId: string;
  token: string;
}

interface JoinLoopResult {
  token: string;
}

interface PromoteResult {
  token: string;
}

export async function createLoop(title: string): Promise<CreateLoopResult> {
  const fn = httpsCallable<{ title: string }, CreateLoopResult>(functions, 'createLoop');
  const result = await fn({ title });
  return result.data;
}

export async function joinLoop(loopId: string): Promise<JoinLoopResult> {
  const fn = httpsCallable<{ loopId: string }, JoinLoopResult>(functions, 'joinLoop');
  const result = await fn({ loopId });
  return result.data;
}

export async function promoteToSpeaker(loopId: string, userId: string): Promise<PromoteResult> {
  const fn = httpsCallable<{ loopId: string; userId: string }, PromoteResult>(
    functions,
    'promoteToSpeaker'
  );
  const result = await fn({ loopId, userId });
  return result.data;
}

export async function endLoop(loopId: string): Promise<void> {
  const fn = httpsCallable<{ loopId: string }, void>(functions, 'endLoop');
  await fn({ loopId });
}
