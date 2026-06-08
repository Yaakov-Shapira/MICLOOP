const admin = require('firebase-admin');

const UID = process.argv[2];
if (!UID) {
  console.error('Usage: node set-admin.js <UID>');
  process.exit(1);
}

admin.initializeApp({ projectId: 'micloop-6333b' });

admin.firestore()
  .doc(`users/${UID}`)
  .set({ isAdmin: true }, { merge: true })
  .then(() => {
    console.log(`✅ isAdmin: true set for UID: ${UID}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
