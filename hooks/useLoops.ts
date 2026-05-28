import { useEffect, useState } from 'react';
import { subscribeLiveLoops, subscribePastLoops, subscribeScheduledLoops } from '../lib/firestore';
import type { Loop } from '../types';

export function useLiveLoops() {
  const [loops, setLoops] = useState<Loop[]>([]);
  useEffect(() => subscribeLiveLoops(setLoops), []);
  return loops;
}

export function usePastLoops() {
  const [loops, setLoops] = useState<Loop[]>([]);
  useEffect(() => subscribePastLoops(setLoops), []);
  return loops;
}

export function useScheduledLoops() {
  const [loops, setLoops] = useState<Loop[]>([]);
  useEffect(() => subscribeScheduledLoops(setLoops), []);
  return loops;
}
