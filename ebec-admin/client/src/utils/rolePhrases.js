const ROLE_PHRASES = {
  vp: [
    "Running the board. Setting the vision.",
    "VP mode: Activated.",
    "Strategy first. Ego never.",
    "Behind every great SG, there's a VP.",
    "Building an empire, one decision at a time.",
    "The backbone of EBEC never rests.",
    "Delegating greatness.",
    "Not just a VP. The VP.",
    "Silent power. Loud results.",
    "Leading from the front."
  ],
  president: [
    "The President has entered the room.",
    "One vision. One team. One EBEC.",
    "Presidential energy only.",
    "The captain steers the ship.",
    "Buck stops here. And it's gold.",
    "Leading with legacy.",
    "Top of the hierarchy. Top of the game.",
    "Presidential aura loading..."
  ],
  secretary_general: [
    "SG? No, DIVA!",
    "SG? No, QUEEN!",
    "Ready to SG the world!",
    "EBEC SG!",
    "SG controlling the world",
    "A7san SG",
    "Administering with Elegance.",
    "The Hub. The Heart. The SG.",
    "Lead. Organize. Conquer.",
    "SECRETARY GENERAL WHOOO",
    "SG li al3alamyaaa!",
    "Empire built on Reports."
  ],
  finance: [
    "Counting coins. Counting wins.",
    "Every penny has a purpose.",
    "Finance runs on precision.",
    "Budgets don't lie.",
    "Making the numbers dance.",
    "Fiscal responsibility is my love language.",
    "Ledger locked. Funds secured.",
    "Money talks. I do the accounting."
  ],
  relex: [
    "Relaxation is a department, not a vibe.",
    "Relex: Where relations meet excellence.",
    "Networking is not just a word.",
    "Building bridges, one connection at a time.",
    "External affairs, internal strength.",
    "Relex never sleeps. Neither do our contacts.",
    "Partnerships built on trust.",
    "The face of EBEC outside the walls."
  ],
  design: [
    "If it's not pixel-perfect, it's not done.",
    "Design is intelligence made visible.",
    "Making EBEC look effortless.",
    "Creativity is not optional.",
    "The aesthetics department has arrived.",
    "Every pixel tells a story.",
    "Designed to impress.",
    "Form follows function. Both matter."
  ],
  it: [
    "Have you tried turning it off and on again?",
    "0 errors. 0 warnings. Pure magic.",
    "The code runs on coffee and deadlines.",
    "If it compiles, ship it.",
    "Building the backbone of EBEC.",
    "Debugging the future.",
    "I don't fix bugs. I resolve anomalies.",
    "0s and 1s, but mostly 1s.",
    "The machine behind the curtain."
  ],
  media_marketing: [
    "Content is king. We are the kingdom.",
    "Marketing EBEC to the world.",
    "If it's not on social media, did it even happen?",
    "Every post is a masterpiece.",
    "Going viral is not an accident.",
    "The megaphone of EBEC.",
    "Likes don't define us. Reach does.",
    "Storytelling with data."
  ],
  hr: [
    "People first. Always.",
    "HR: The heartbeat of the team.",
    "Managing humans. No manual included.",
    "Culture is not a perk. It's the foundation.",
    "The glue that holds it all together.",
    "Recruiting greatness, one soul at a time.",
    "Happy team. Strong team.",
    "We don't just hire. We choose family."
  ],
  logistics: [
    "If it moves, we manage it.",
    "Logistics: The art of making things happen.",
    "Behind every event, there's a logistics team.",
    "Precision delivery. Zero excuses.",
    "Transportation, coordination, domination.",
    "Moving pieces so others can shine.",
    "The invisible hand of every event.",
    "From A to B, flawlessly."
  ],
  events: [
    "Every event is a stage. We own it.",
    "Events don't plan themselves. We do.",
    "Creating moments that matter.",
    "The show must go on. And it will.",
    "From concept to confetti.",
    "Orchestrating chaos into magic.",
    "Events are our love language.",
    "The spotlight is our home."
  ],
  general: [
    "Just another day at EBEC.",
    "Keeping the engine running.",
    "Small steps. Big impact.",
    "The unsung heroes of the team.",
    "Doing what needs to be done.",
    "Teamwork makes the dream work.",
    "Here to make a difference.",
    "Consistency beats talent."
  ],
  member: [
    "Proud member of the team.",
    "Every role matters. Including mine.",
    "Part of something bigger.",
    "Showing up is half the battle.",
    "Here for the journey.",
    "Building something meaningful.",
    "One team. One dream.",
    "Contributing my best every day."
  ]
};

const DEPARTMENT_TO_ROLE_KEY = {
  'Finance & Legal': 'finance',
  'Relex': 'relex',
  'Design': 'design',
  'IT': 'it',
  'Media & Marketing': 'media_marketing',
  'HR': 'hr',
  'Logistics': 'logistics',
  'Events': 'events',
  'General': 'general'
};

const ROLE_TO_ROLE_KEY = {
  'President': 'president',
  'Vice President': 'vp',
  'Secretary General': 'secretary_general',
  'Manager': null,
  'Co-Manager': null,
  'Department Head': null,
  'Member': 'member'
};

export function getPhrasesForUser({ profileRole, managerRole, managerDepartment, email, vpEmail }) {
  if (email && email.toLowerCase() === vpEmail) return ROLE_PHRASES.vp;

  if (profileRole === 'vp' || profileRole === 'admin') return ROLE_PHRASES.vp;

  if (managerDepartment) {
    const deptKey = DEPARTMENT_TO_ROLE_KEY[managerDepartment];
    if (deptKey) return ROLE_PHRASES[deptKey];
  }

  if (managerRole) {
    const roleKey = ROLE_TO_ROLE_KEY[managerRole];
    if (roleKey) return ROLE_PHRASES[roleKey];
  }

  if (profileRole) {
    const lower = profileRole.toLowerCase();
    if (lower.includes('president')) return ROLE_PHRASES.president;
    if (lower.includes('secretary') || lower.includes('sg')) return ROLE_PHRASES.secretary_general;
    if (lower.includes('finance') || lower.includes('legal')) return ROLE_PHRASES.finance;
    if (lower.includes('relex')) return ROLE_PHRASES.relex;
    if (lower.includes('design')) return ROLE_PHRASES.design;
    if (lower.includes('it') || lower.includes('tech')) return ROLE_PHRASES.it;
    if (lower.includes('media') || lower.includes('marketing')) return ROLE_PHRASES.media_marketing;
    if (lower.includes('hr') || lower.includes('human')) return ROLE_PHRASES.hr;
    if (lower.includes('logist')) return ROLE_PHRASES.logistics;
    if (lower.includes('event')) return ROLE_PHRASES.events;
  }

  return ROLE_PHRASES.general;
}

export function getRoleLabel({ profileRole, managerRole, managerDepartment }) {
  if (profileRole === 'vp' || profileRole === 'admin') return 'Vice President';
  if (managerRole) {
    if (managerDepartment) return `${managerRole} • ${managerDepartment}`;
    return managerRole;
  }
  if (profileRole) return profileRole;
  return 'Team Member';
}

console.log('[ROLE_PHRASES] Loaded', Object.keys(ROLE_PHRASES).length, 'role categories');
