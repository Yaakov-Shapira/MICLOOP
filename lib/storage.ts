import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadRecording(
  loopId: string,
  uri: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, `recordings/${loopId}/${Date.now()}.webm`);
  const task = uploadBytesResumable(storageRef, blob, { contentType: 'audio/webm' });

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) {
          onProgress((snap.bytesTransferred / snap.totalBytes) * 100);
        }
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
