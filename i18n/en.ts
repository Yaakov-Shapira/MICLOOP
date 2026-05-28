const en = {
  // Navigation
  nav: {
    home: 'Home',
    schedule: 'Schedule',
    library: 'Library',
    profile: 'Profile',
  },

  // Home Feed
  home: {
    liveNow: 'Live Now',
    upNext: 'Up Next',
    pastLoops: 'Past Loops',
    myRecordings: 'My Recordings',
    startLoop: 'Start Loop',
    joinLoop: 'Join',
    listeners: 'listeners',
    noLiveLoops: 'No live loops right now',
    noRecordings: 'No saved recordings',
  },

  // New Loop Sheet
  newLoop: {
    title: 'New Loop',
    placeholder: "What will you talk about?",
    start: 'Start',
    charLimit: '{{count}}/80',
  },

  // Live Room
  room: {
    live: 'LIVE',
    listeners: '{{count}} listeners',
    mute: 'Mute',
    unmute: 'Unmute',
    raiseHand: 'Raise Hand',
    lowerHand: 'Lower Hand',
    endLoop: 'End Loop',
    leaveLoop: 'Leave',
    chat: 'Chat',
    music: 'Music',
    reactions: 'React',
    queue: 'Queue',
    approve: 'Approve',
    deny: 'Deny',
    recording: 'Recording',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    rateLoop: 'Rate this Loop',
    rateSubtitle: 'How did you enjoy it?',
    submit: 'Submit',
    skip: 'Skip',
    speaking: 'Speaking',
    muted: 'Muted',
  },

  // Chat
  chat: {
    placeholder: 'Write a message...',
    send: 'Send',
  },

  // Auth
  auth: {
    welcome: 'Welcome to MicLoop',
    subtitle: 'Join live voice conversations',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+1 555-0000',
    sendCode: 'Send Code',
    otpLabel: 'Verification Code',
    otpPlaceholder: '------',
    verify: 'Verify',
    resend: 'Resend',
    changePhone: 'Change Number',
    setName: "What's your name?",
    namePlaceholder: 'Full name',
    nameNext: 'Continue',
  },

  // Gate Modal
  gate: {
    title: 'Sign In Required',
    subtitle: 'Sign in to continue',
    signIn: 'Sign In / Sign Up',
    cancel: 'Cancel',
  },

  // Library
  library: {
    title: 'Library',
    liked: 'Liked Loops',
    recordings: 'Recordings',
    empty: 'Tap ❤️ on a loop to save it here',
    noRecordings: 'No saved recordings',
    play: 'Play',
    delete: 'Delete',
  },

  // Schedule
  schedule: {
    title: 'Schedule',
    scheduleLoop: 'Schedule Loop',
    noScheduled: 'No scheduled loops',
    remind: 'Remind me',
    reminded: 'Reminder set',
    titleField: 'Topic',
    dateField: 'Date',
    timeField: 'Time',
    create: 'Create',
  },

  // Profile
  profile: {
    title: 'Profile',
    editPhoto: 'Edit Photo',
    name: 'Name',
    phone: 'Phone',
    save: 'Save',
    becomeHost: 'Become a Host',
    hostBadge: 'Verified Host ✓',
    requestHost: 'Request Host Access',
    topic: 'Topics you will host',
    preferredTime: 'Preferred hours',
    sendRequest: 'Send Request',
    requestSent: 'Request sent!',
    admin: 'Admin Panel',
  },

  // Errors / Toasts
  errors: {
    micPermission: 'Microphone permission required',
    loopNotFound: 'Loop not found',
    genericError: 'Something went wrong, please try again',
    networkError: 'Connection error',
  },

  toasts: {
    loopCreated: 'Loop started!',
    recordingSaved: 'Recording saved',
    recordingDeleted: 'Recording deleted',
    loopEnded: 'Loop ended',
    promoted: "You can speak now!",
    handRaised: 'Hand raised',
    handLowered: 'Hand lowered',
    linkCopied: 'Link copied',
    ratingSubmitted: 'Thanks for rating!',
  },
};

export default en;
