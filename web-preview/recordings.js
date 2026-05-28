/**
 * recordings.js
 * IndexedDB wrapper for storing/retrieving audio blobs across pages.
 * DB: "micloop-db" | Store: "recordings"
 */

const _DB_NAME    = 'micloop-db'
const _STORE_NAME = 'recordings'
const _DB_VERSION = 1

function _openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(_DB_NAME, _DB_VERSION)

    req.onupgradeneeded = e => {
      const db    = e.target.result
      const store = db.createObjectStore(_STORE_NAME, {
        keyPath:       'id',
        autoIncrement: true,
      })
      store.createIndex('date', 'date', { unique: false })
    }

    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

/**
 * Save a recording.
 * @param {Blob}   blob
 * @param {string} name      Display label, e.g. "הקלטה - 19:30"
 * @param {number} duration  Seconds
 * @param {string} mimeType
 * @returns {Promise<number>} The auto-generated record id
 */
async function saveRecording({ blob, name, duration, mimeType }) {
  const db = await _openDB()
  return new Promise((resolve, reject) => {
    const record = {
      name,
      date:     new Date().toISOString(),
      blob,
      duration,
      mimeType,
    }
    const tx  = db.transaction(_STORE_NAME, 'readwrite')
    const req = tx.objectStore(_STORE_NAME).add(record)
    req.onsuccess = e => resolve(e.target.result)
    req.onerror   = e => reject(e.target.error)
  })
}

/**
 * Return all recordings, newest first.
 * @returns {Promise<Array>}
 */
async function getAllRecordings() {
  const db = await _openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(_STORE_NAME, 'readonly')
    const req = tx.objectStore(_STORE_NAME).getAll()
    req.onsuccess = e => resolve([...e.target.result].reverse())
    req.onerror   = e => reject(e.target.error)
  })
}

/**
 * Delete a recording by its id.
 * @param {number} id
 */
async function deleteRecording(id) {
  const db = await _openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(_STORE_NAME, 'readwrite')
    const req = tx.objectStore(_STORE_NAME).delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = e  => reject(e.target.error)
  })
}
