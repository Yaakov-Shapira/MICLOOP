const he = {
  // Navigation
  nav: {
    home: 'בית',
    schedule: 'לוח זמנים',
    library: 'ספרייה',
    profile: 'פרופיל',
  },

  // Home Feed
  home: {
    liveNow: 'שידור חי',
    upNext: 'הבא תכף',
    pastLoops: 'לופים קודמים',
    myRecordings: 'ההקלטות שלי',
    startLoop: 'התחל לופ',
    joinLoop: 'כנס ללופ',
    listeners: 'מאזינים',
    noLiveLoops: 'אין שידורים חיים כרגע',
    noRecordings: 'אין הקלטות שמורות',
  },

  // New Loop Sheet
  newLoop: {
    title: 'לופ חדש',
    placeholder: 'על מה תדבר?',
    start: 'התחל',
    charLimit: '{{count}}/80',
  },

  // Live Room
  room: {
    live: 'LIVE',
    listeners: '{{count}} מאזינים',
    mute: 'השתק',
    unmute: 'בטל השתקה',
    raiseHand: 'הרם יד',
    lowerHand: 'הורד יד',
    endLoop: 'סיים לופ',
    leaveLoop: 'עזוב לופ',
    chat: 'צ׳אט',
    music: 'מוסיקה',
    reactions: 'תגובות',
    queue: 'ממתינים',
    approve: 'אשר',
    deny: 'דחה',
    recording: 'מקליט',
    startRecording: 'התחל הקלטה',
    stopRecording: 'עצור הקלטה',
    rateLoop: 'דרג את הלופ',
    rateSubtitle: 'כמה נהנית?',
    submit: 'שלח',
    skip: 'דלג',
    speaking: 'מדבר',
    muted: 'מושתק',
  },

  // Chat
  chat: {
    placeholder: 'כתוב הודעה...',
    send: 'שלח',
  },

  // Auth
  auth: {
    welcome: 'ברוך הבא ל-MicLoop',
    subtitle: 'הצטרף לשיחות קוליות חיות',
    phoneLabel: 'מספר טלפון',
    phonePlaceholder: '050-0000000',
    sendCode: 'שלח קוד',
    otpLabel: 'קוד אימות',
    otpPlaceholder: '------',
    verify: 'אמת',
    resend: 'שלח שוב',
    changePhone: 'שנה מספר',
    setName: 'איך קוראים לך?',
    namePlaceholder: 'שם מלא',
    nameNext: 'המשך',
  },

  // Gate Modal
  gate: {
    title: 'כניסה נדרשת',
    subtitle: 'התחבר כדי להמשיך',
    signIn: 'כניסה / הרשמה',
    cancel: 'ביטול',
  },

  // Library
  library: {
    title: 'ספרייה',
    liked: 'לופים שאהבתי',
    recordings: 'הקלטות',
    empty: 'לחץ ❤️ על לופ כדי לשמור אותו כאן',
    noRecordings: 'אין הקלטות שמורות',
    play: 'נגן',
    delete: 'מחק',
  },

  // Schedule
  schedule: {
    title: 'לוח זמנים',
    scheduleLoop: 'קבע לופ',
    noScheduled: 'אין לופים מתוכננים',
    remind: 'הזכר לי',
    reminded: 'תזכורת פעילה',
    titleField: 'נושא הלופ',
    dateField: 'תאריך',
    timeField: 'שעה',
    create: 'צור',
  },

  // Profile
  profile: {
    title: 'פרופיל',
    editPhoto: 'ערוך תמונה',
    name: 'שם',
    phone: 'טלפון',
    save: 'שמור',
    becomeHost: 'הפוך למארח',
    hostBadge: 'מארח מוסמך ✓',
    requestHost: 'בקש לארח',
    topic: 'נושאים שתארח',
    preferredTime: 'שעות מועדפות',
    sendRequest: 'שלח בקשה',
    requestSent: 'הבקשה נשלחה!',
    admin: 'פאנל ניהול',
  },

  // Errors / Toasts
  errors: {
    micPermission: 'נדרשת הרשאה למיקרופון',
    loopNotFound: 'הלופ לא נמצא',
    genericError: 'משהו השתבש, נסה שוב',
    networkError: 'בעיית חיבור',
  },

  toasts: {
    loopCreated: 'הלופ התחיל!',
    recordingSaved: 'הקלטה נשמרה',
    recordingDeleted: 'הקלטה נמחקה',
    loopEnded: 'הלופ הסתיים',
    promoted: 'קיבלת הרשאת דיבור!',
    handRaised: 'ידך הורמה',
    handLowered: 'ידך הורדה',
    linkCopied: 'קישור הועתק',
    ratingSubmitted: 'תודה על הדירוג!',
  },
};

export default he;
