export const APP_COPY = {
  landing: {
    paragraphs: [
      "G’day mate!",
      "Sydney has too many good beaches. Annoying problem, honestly. Sounds unreal until you’re standing there in thongs trying to decide between Manly, Coogee, Maroubra, Cronulla, Freshie, Shelly…then somehow ending up at Bondi with half the city and three backpacker volleyball comps.",
      "We kinda sort the drama out. Tell us the vibe, quiet dip, big arvo with mates, sneaky date spot, or somewhere to vanish for a bit and we’ll check the swell, wind, UV, and general beach chaos to pick a Sydney beach that actually suits. Righto, let’s sort your beach.",
    ],
  },
  home: {
    headline: ["How ya goin'", "mate, what beach", "we hitting?"],
    subcopy: "",
    mapMarker: "Shelly Beach",
    mapAlt: "Sydney coastline map",
  },
  result: {
    ticket: {
      label: "Your mood reads like:",
      destinationPrefix: "Go to",
      bestTimeLabel: "Best time:",
      whyLabel: "Why this fits:",
      conditionsLabel: "Today there:",
      bringLabel: "Bring:",
      imageAlt: "Beach umbrella on a small island",
    },
    mockPlan: {
      eyebrow: "YOUR BEACH PLAN · GENERATED NOW",
      beachName: "Manly Beach",
      moodPhrase: "proper surf day. I want real waves, not Bondi tourist slop.",
      conditions: [
        "🌡 21°C",
        "💨 NE 18kn — pumping",
        "🌊 1.4m — proper waves",
        "☀️ UV 7",
      ],
      where: "North Steyne — the northern third, away from the surf school chaos in the middle. The right-handers off the northern point are cooking today. Manly Ferry from Circular Quay: 30 mins, genuinely one of the best commutes in the world.",
      when: "9am sharp. NE swell is peaking this morning before the southerly rolls in around 3pm and closes everything out. Don't sleep in.",
      bring: [
        "board (or hire at Manly Surf School)",
        "rash vest — wind's sharp",
        "zinc, not just SPF",
        "cash for a post-surf pie at the kiosk",
      ],
      why: "1.4m NE swell with a 12-second period means proper, organised lines — not the crossed-up mush Bondi gets. North Steyne will have 4-5 foot faces on the sets. It's busy, yeah, but so is every good break on a day like this. The energy's part of it.",
      verdict: "— certified ripper conditions, get out there.",
    },
    mockPlansByMood: {
      solo: {
        beachName: "Shelly Beach",
        moodTags: ["quiet", "private", "slow"],
        bestTime: "After 4:30PM",
        why: "Shelly is protected, calm, and better suited to the quiet reset you described.",
        conditions: "22°C · light wind · gentle swell · high UV",
        bring: ["water", "towel", "book", "light jacket"],
      },
      energy: {
        beachName: "Manly Beach",
        moodTags: ["surf", "movement", "awake"],
        bestTime: "Before 10:00AM",
        why: "Manly gives you proper room to move without pretending Bondi is a good idea at midday.",
        conditions: "23°C · nor'easter later · workable swell · high UV",
        bring: ["zinc", "towel", "water", "post-swim snack"],
      },
      couple: {
        beachName: "Milk Beach",
        moodTags: ["soft", "scenic", "low-key"],
        bestTime: "After 5:00PM",
        why: "Milk keeps the harbour calm and the effort low, which is usually the whole point of a decent date.",
        conditions: "22°C · light wind · flat water · high UV",
        bring: ["picnic", "light towel", "sunnies", "something cold"],
      },
      dog: {
        beachName: "Silver Beach",
        moodTags: ["dog", "roomy", "low-drama"],
        bestTime: "Before 9:00AM",
        why: "Silver gives the dog space to lose the plot a bit while you still get a proper bit of coast.",
        conditions: "21°C · light wind · calm bay · moderate UV",
        bring: ["lead", "water bowl", "old towel", "poo bags"],
      },
      family: {
        beachName: "Balmoral Beach",
        moodTags: ["family", "calm", "organised"],
        bestTime: "Before 11:00AM",
        why: "Balmoral has flat water, shade, toilets, and fewer ways for the day to become admin.",
        conditions: "22°C · light wind · flat water · high UV",
        bring: ["rashies", "snacks", "bucket", "patience"],
      },
      default: {
        beachName: "Bronte Beach",
        moodTags: ["swim", "park", "steady"],
        bestTime: "Mid-morning",
        why: "Bronte gives you ocean, grass, and a rockpool without making the whole day about being seen.",
        conditions: "22°C · light wind · gentle swell · high UV",
        bring: ["SPF 50", "towel", "book", "coffee money"],
      },
    },
  },
};

export const VIBES = [
  {
    id: "solo",
    emoji: "🧘",
    label: "need to disappear",
    phrase: "I need to disappear alone for a few hours. Proper quiet, no one I know.",
  },
  {
    id: "energy",
    emoji: "🤙",
    label: "big arvo energy",
    phrase: "I want big beach energy. A swim, some sun, maybe a little chaos.",
  },
  {
    id: "couple",
    emoji: "❤️",
    label: "romantic-ish",
    phrase: "Beach day with my favourite person. Calm vibes, nowhere to be.",
  },
  {
    id: "dog",
    emoji: "🐕",
    label: "bringing the dog",
    phrase: "Taking my dog somewhere beautiful. Ideally somewhere she can lose the plot safely.",
  },
  {
    id: "read",
    emoji: "📖",
    label: "read a bloody book",
    phrase: "I just want to sit somewhere stunning and read without being bothered.",
  },
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    label: "family circus",
    phrase: "Family beach day. Need calm water, shade, and minimal disaster.",
  },
  {
    id: "surf",
    emoji: "🏄",
    label: "chase the swell",
    phrase: "Proper surf day. I want real waves, not tourist slop.",
  },
  {
    id: "sunset",
    emoji: "🌅",
    label: "golden hour",
    phrase: "I want a dramatic sunset somewhere that isn’t completely rammed.",
  },
];

export const PLACEHOLDERS = [
  "what are you actually after today…",
  "describe the vibe, even if it’s unhinged…",
  "it’s okay to say “I just need to get out of the house”…",
  "who ya going with? what’s the energy?",
  "be honest. filter-free zone…",
  "just say the mood. we’ll do the coastal admin…",
];

export const MOOD_RINGS = [
  {
    keywords: ["alone", "solo", "disappear", "quiet", "peace", "read", "book"],
    color: "#7dd3fc",
    label: "introvert mode activated",
  },
  {
    keywords: ["surf", "wave", "swell", "big", "energy", "send"],
    color: "#6ee7b7",
    label: "full send energy",
  },
  {
    keywords: ["partner", "date", "romantic", "couple", "favourite person"],
    color: "#f9a8d4",
    label: "romantic-ish. cute.",
  },
  {
    keywords: ["dog", "pup", "doggo"],
    color: "#fdba74",
    label: "dog tax incoming",
  },
  {
    keywords: ["sunset", "golden", "dusk", "evening"],
    color: "#f0abfc",
    label: "chasing the light",
  },
  {
    keywords: ["family", "kids", "child", "chaos"],
    color: "#86efac",
    label: "parent mode: activated",
  },
  {
    keywords: ["escape", "work", "burnout", "tired", "need"],
    color: "#fcd34d",
    label: "classic Sydney burnout",
  },
];

export const ARC_MESSAGES = [
  [0, "say anything, even just a vibe"],
  [3, "keep going, we’re listening…"],
  [7, "yeah nah yeah, getting the picture"],
  [12, "now we’re cooking"],
  [18, "fully cooked. we’ve got this ✦"],
];

export const GENERATING_STEPS = [
  "checking live swell + conditions",
  "reading your vibe, no judgment",
  "vetoing the obvious tourist traps",
  "finding your beach",
];

export const GENERATING_COPY = [
  {
    keywords: ["surf", "wave", "swell"],
    title: "out there checking the sets…",
    subtitle: "talking to the regulars, sizing up the breaks",
  },
  {
    keywords: ["alone", "solo", "quiet"],
    title: "finding you some proper quiet…",
    subtitle: "somewhere no one will bother you. promise.",
  },
  {
    keywords: ["dog"],
    title: "dog-proofing your beach day…",
    subtitle: "checking rules, vibes, and seagull risk",
  },
  {
    keywords: ["family", "kids"],
    title: "running the family checklist…",
    subtitle: "shallow water, shade, coffee nearby for survival",
  },
  {
    keywords: ["sunset", "golden"],
    title: "calculating golden hour…",
    subtitle: "you’ve got a window. don’t muck about.",
  },
];

export const TOASTS = {
  copied: "copied to clipboard, legend ✓",
  saved: "saved. future you says cheers.",
  deleted: "gone. probably for the best.",
  notesSaved: "notes saved. tidy.",
  replayed: "same mood, fresh coast.",
  loginRequired: "make an account if you want to keep this little beauty.",
  error: "something cooked itself. try again.",
};

export const ERROR_COPY = {
  gemini: "Couldn’t generate a plan right now. The beach oracle is having a moment.",
  weather: "Live conditions are being a bit dramatic. We’ll use what we can.",
  network: "No connection. Even the coast needs reception.",
  auth: "Log in first, legend.",
  notFound: "This plan’s gone walkabout.",
  deleteFailed: "Couldn’t delete it. Classic.",
};

export const EMPTY_STATES = {
  plans: {
    title: "No plans yet.",
    body: "Tell us the mood and we’ll make one worth leaving the house for.",
  },
  shelf: {
    title: "Nothing on the shelf.",
    body: "Saved beach days will live here once future you gets organised.",
  },
  profile: {
    title: "Profile’s a bit bare.",
    body: "Add the basics so the coast-picking gets less guessy.",
  },
};

export const BUTTON_COPY = {
  enterExperience: "Enter experience",
  generatePlan: "Find my beach",
  save: "Save",
  delete: "Delete",
  replay: "Replay",
  login: "Log in",
  register: "Sign up",
};

export const LOADING_COPY = {
  moodSearch: "checking the coast...",
};

export const LANDING_COPY = APP_COPY.landing;
export const HOME_COPY = APP_COPY.home;
export const RESULT_COPY = APP_COPY.result;
