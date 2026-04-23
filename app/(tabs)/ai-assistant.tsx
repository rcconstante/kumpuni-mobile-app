import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Send, FileText, ArrowRight, Sparkles, Zap, Wrench, Home, Cpu, Car, RotateCcw } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { findBestGuides, ScoredGuide, getSuggestedCategories } from '@/data/guideContent';

/* ─── Unique ID helper ──────────────────────────────── */
let _idSeq = 0;
function uid(prefix = ''): string {
  return `${prefix}${Date.now()}-${++_idSeq}-${Math.random().toString(36).slice(2, 5)}`;
}

/* ─── Types ───────────────────────────────────────────── */
type Message = {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  guides?: ScoredGuide[];
  photoUri?: string;
};

/* ─── Quick-start chips ───────────────────────────────── */
const CHIPS = [
  'My faucet is leaking',
  'AC not cooling',
  'Car won\'t start',
  'Phone not charging',
];

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  home: Home,
  appliances: Wrench,
  car: Car,
  electronics: Cpu,
};

const CATEGORY_LABELS: Record<string, string> = {
  home: 'Home',
  appliances: 'Appliances',
  car: 'Car',
  electronics: 'Electronics',
};

const CATEGORY_COLORS: Record<string, string> = {
  home: '#3B82F6',
  appliances: '#F59E0B',
  car: '#EF4444',
  electronics: '#8B5CF6',
};

/* ─── Markdown bold parser ────────────────────────────── */
function MarkdownText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: '700', color: '#1F2937' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

/* ─── Typewriter / streaming text ─────────────────────── */
function TypewriterText({ text, onDone, onProgress }: { text: string; onDone?: () => void; onProgress?: () => void }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i % 5 === 0) onProgress?.();
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 16);
    return () => clearInterval(interval);
  }, [text]);

  return <MarkdownText text={displayed} />;
}

/* ─── Typing dots animation ───────────────────────────── */
function TypingDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={{ fontSize: 13, color: '#9CA3AF', letterSpacing: 2 }}>
      {'•'.repeat(dots).padEnd(3, ' ')}
    </Text>
  );
}

/* ─── Profanity filter ───────────────────────────────── */
const PROFANITY_LIST = ['damn', 'hell', 'crap', 'stupid', 'idiot', 'dumb', 'shut up', 'hate you', 'useless', 'worst', 'trash', 'garbage', 'suck', 'sucks'];
function detectProfanity(query: string): boolean {
  const q = query.toLowerCase();
  return PROFANITY_LIST.some((w) => q.includes(w));
}
function getProfanityReply(): string {
  const replies = [
    `I understand you're frustrated, but I'm here to help. Could you tell me more about what's broken so I can find the right guide?`,
    `No worries — repairs can be stressful. Let's focus on fixing the problem. What are you dealing with?`,
    `I'm built to help with home repairs. Let's work together — what's the issue you're facing?`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

/* ─── Expanded keyword synonym maps ──────────────────── */
const SYNONYM_MAP: Record<string, string[]> = {
  // Plumbing synonyms
  dripping: ['leak', 'faucet', 'water'],
  trickling: ['leak', 'flow', 'pressure'],
  overflowing: ['clog', 'backup', 'toilet', 'sink'],
  backflow: ['drain', 'sewer', 'pipe'],
  gurgling: ['drain', 'clog', 'pipe', 'sewer'],
  'no pressure': ['pressure', 'low', 'flow', 'weak'],
  'weak flow': ['pressure', 'flow', 'faucet', 'shower'],
  'water hammer': ['pipe', 'noise', 'bang', 'pressure'],
  'rusty water': ['water', 'pipe', 'corrosion', 'brown'],
  'foul smell': ['sewer', 'drain', 'gas', 'odor'],
  // Electrical synonyms
  flickering: ['light', 'bulb', 'loose', 'outlet'],
  buzzing: ['outlet', 'breaker', 'electrical', 'danger'],
  'tripping breaker': ['breaker', 'overload', 'circuit', 'electrical'],
  'no power': ['outlet', 'breaker', 'electricity', 'dead'],
  'intermittent power': ['outlet', 'loose', 'wire', 'connection'],
  sparks: ['outlet', 'danger', 'fire', 'electrical'],
  'burning smell': ['outlet', 'wire', 'danger', 'fire', 'overheat'],
  overload: ['breaker', 'circuit', 'too many', 'electrical'],
  // Appliance synonyms
  'humming but not working': ['motor', 'appliance', 'stuck', 'washer'],
  'cycles not finishing': ['washer', 'dryer', 'timer', 'appliance'],
  overheating: ['fridge', 'ac', 'fan', 'danger', 'hot'],
  'not spinning': ['washer', 'dryer', 'motor', 'belt'],
  'not draining': ['washer', 'dishwasher', 'drain', 'pump', 'clog'],
  'ice buildup': ['fridge', 'freezer', 'frost', 'defrost'],
  condensation: ['fridge', 'ac', 'water', 'leak'],
  // Car synonyms
  'clicking sound': ['battery', 'starter', 'car', 'engine'],
  'cranking but not starting': ['battery', 'starter', 'fuel', 'car'],
  'engine stalling': ['car', 'fuel', 'sensor', 'idle'],
  'rough idle': ['car', 'engine', 'misfire', 'spark'],
  vibration: ['car', 'tire', 'wheel', 'alignment'],
  'smoke white': ['car', 'engine', 'coolant', 'head gasket'],
  'smoke black': ['car', 'engine', 'oil', 'burning'],
  'smoke blue': ['car', 'engine', 'oil', 'burning'],
  'dashboard light': ['car', 'warning', 'check engine', 'oil', 'battery'],
  // Electronics synonyms
  lagging: ['phone', 'laptop', 'slow', 'performance'],
  freezing: ['phone', 'laptop', 'screen', 'crash'],
  'not responding': ['phone', 'laptop', 'frozen', 'crash'],
  'battery draining fast': ['phone', 'laptop', 'charger', 'battery'],
  'screen flickering': ['phone', 'laptop', 'display', 'loose'],
  'ghost touch': ['phone', 'screen', 'digitizer', 'tablet'],
};

/* ─── Entity extraction ────────────────────────────────── */
type ExtractedEntity = {
  category: string | null;
  object: string | null;
  symptom: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  urgency: 'low' | 'medium' | 'high' | null;
};

function extractEntities(query: string): ExtractedEntity {
  const q = query.toLowerCase();
  let category: string | null = null;
  let object: string | null = null;
  let symptom: string | null = null;
  let severity: 'low' | 'medium' | 'high' | null = null;
  let urgency: 'low' | 'medium' | 'high' | null = null;

  // Category detection
  const plumbingWords = ['faucet', 'sink', 'toilet', 'pipe', 'drain', 'shower', 'leak', 'plumbing', 'water'];
  const electricalWords = ['outlet', 'breaker', 'light', 'wiring', 'electric', 'bulb', 'switch', 'power'];
  const applianceWords = ['washer', 'fridge', 'ac', 'microwave', 'dryer', 'dishwasher', 'oven', 'appliance'];
  const carWords = ['car', 'battery', 'tire', 'engine', 'oil', 'brake', 'starter', 'vehicle'];
  const electronicsWords = ['phone', 'laptop', 'router', 'wifi', 'screen', 'charger', 'computer', 'tablet'];

  if (plumbingWords.some((w) => q.includes(w))) category = 'plumbing';
  else if (electricalWords.some((w) => q.includes(w))) category = 'electrical';
  else if (applianceWords.some((w) => q.includes(w))) category = 'appliances';
  else if (carWords.some((w) => q.includes(w))) category = 'car';
  else if (electronicsWords.some((w) => q.includes(w))) category = 'electronics';

  // Object detection
  const objects = ['faucet', 'sink', 'toilet', 'pipe', 'drain', 'shower', 'washer', 'fridge', 'ac', 'microwave', 'car', 'battery', 'tire', 'phone', 'laptop', 'router', 'outlet', 'breaker', 'light', 'screen', 'door', 'window', 'wall', 'charger'];
  for (const obj of objects) {
    if (q.includes(obj)) { object = obj; break; }
  }

  // Symptom detection
  const symptoms = ['leak', 'drip', 'clog', 'not working', 'broken', 'noise', 'smell', 'hot', 'cold', 'slow', 'fast', 'dead', 'crack', 'flicker'];
  for (const s of symptoms) {
    if (q.includes(s)) { symptom = s; break; }
  }

  // Severity
  if (q.includes('emergency') || q.includes('dangerous') || q.includes('fire') || q.includes('sparks') || q.includes('everywhere')) {
    severity = 'high'; urgency = 'high';
  } else if (q.includes('urgent') || q.includes('quick') || q.includes('soon')) {
    severity = 'medium'; urgency = 'high';
  } else if (q.includes('slowly') || q.includes('minor') || q.includes('small')) {
    severity = 'low'; urgency = 'low';
  }

  return { category, object, symptom, severity, urgency };
}

/* ─── Danger detection ───────────────────────────────── */
function detectDanger(query: string): { isDangerous: boolean; warning: string | null } {
  const q = query.toLowerCase();
  const dangerCombos = [
    { keywords: ['water', 'electric'], warning: '**⚠️ DANGER: Water + Electricity**\n\nThis is a serious safety hazard. Do NOT touch any electrical outlets, switches, or appliances near water. Turn off the main breaker immediately and call a licensed electrician or emergency services.' },
    { keywords: ['gas', 'smell'], warning: '**⚠️ DANGER: Possible Gas Leak**\n\nIf you smell gas, do NOT use any electrical switches or open flames. Leave the area immediately and call your gas company or emergency services from outside.' },
    { keywords: ['sparks', 'smoke'], warning: '**⚠️ DANGER: Electrical Fire Risk**\n\nSparks or smoke from electrical components are extremely dangerous. Turn off the breaker for that circuit immediately. Do NOT attempt DIY repairs. Call an electrician right away.' },
    { keywords: ['roof', 'collapse'], warning: '**⚠️ DANGER: Structural Issue**\n\nThis could be a structural safety concern. Evacuate the area if necessary and contact a professional contractor immediately.' },
  ];

  for (const combo of dangerCombos) {
    if (combo.keywords.every((k) => q.includes(k))) {
      return { isDangerous: true, warning: combo.warning };
    }
  }
  return { isDangerous: false, warning: null };
}

/* ─── Intent detection ───────────────────────────────── */
type Intent =
  | 'greeting' | 'thanks' | 'goodbye' | 'capabilities' | 'identity' | 'joke' | 'offtopic'
  | 'profanity'
  | 'symptom_describe' | 'diagnosis' | 'step_by_step' | 'quick_fix' | 'tools_needed'
  | 'difficulty' | 'time_estimate' | 'cost_estimate' | 'safety_check' | 'replace_vs_fix'
  | 'compare_solutions' | 'follow_up' | 'clarification' | 'rephrase' | 'repeat' | 'expand'
  | 'summarize' | 'find_parts' | 'brand_specific' | 'model_specific' | 'location_help'
  | 'emergency' | 'preventive' | 'multi_issue' | 'confidence_check' | 'alternative_solution'
  | 'developer' | 'expert';

function detectIntent(query: string): { intent: Intent; detail?: string } {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  // Profanity / frustration filter
  if (detectProfanity(q)) {
    return { intent: 'profanity' };
  }

  // Emergency (check before everything else)
  const emergencyWords = ['emergency', 'urgent', 'flooding', 'fire', 'sparks', 'smoke', 'gas leak', 'electrocution', 'danger'];
  if (emergencyWords.some((e) => q.includes(e))) {
    return { intent: 'emergency' };
  }

  // Greetings
  const greetingWords = ['good morning', 'good afternoon', 'good evening', 'greetings', 'what\'s up', 'howdy'];
  if (greetingWords.some((g) => q.includes(g))) return { intent: 'greeting' };
  // standalone greeting words (must be word-boundary matched)
  const standaloneGreetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'hiya'];
  const wordsOnly = q.split(/[^a-z]+/).filter(Boolean);
  if (standaloneGreetings.some((g) => wordsOnly.includes(g))) return { intent: 'greeting' };

  // Thanks (exact word match only — prevents "cooling" matching "cool")
  const thanksWords = ['thank', 'thanks', 'appreciate', 'grateful', 'cheers', 'ty', 'thx', 'nice', 'awesome', 'great'];
  const cleanWords = q.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 1);
  if (thanksWords.some((t) => cleanWords.includes(t))) {
    return { intent: 'thanks' };
  }

  // Goodbye
  const goodbyeWords = ['bye', 'goodbye', 'see you', 'cya', 'later', 'take care', 'night', 'sleep'];
  if (goodbyeWords.some((g) => q.includes(g))) {
    return { intent: 'goodbye' };
  }

  // Identity / about me / developer
  const identityWords = ['who are you', 'what are you', 'who made you', 'who created you', 'about you', 'tell me about', 'your name', 'are you human', 'are you ai', 'are you real'];
  if (identityWords.some((i) => q.includes(i))) {
    return { intent: 'identity' };
  }
  const devWords = ['developer', 'who built you', 'who programmed you', 'who made this app', 'who owns', 'who owns kumpuni', 'creator', 'team behind'];
  if (devWords.some((d) => q.includes(d))) {
    return { intent: 'developer' };
  }

  // Joke
  const jokeWords = ['joke', 'funny', 'laugh', 'humor', 'make me laugh', 'tell me a joke', 'bored'];
  if (jokeWords.some((j) => q.includes(j))) {
    return { intent: 'joke' };
  }

  // Capabilities
  const capWords = ['what can you do', 'what do you do', 'how do you work', 'capabilities', 'features', 'help me', 'how does this work', 'what should i ask'];
  if (capWords.some((c) => q.includes(c)) || (words.includes('what') && words.includes('do') && words.length < 6)) {
    return { intent: 'capabilities' };
  }

  // --- Repair-specific intents ---
  // Symptom describe — only if user is purely describing, NOT asking for help
  const repairRequestIndicators = ['fix', 'repair', 'help', 'how', 'my', 'broken', 'not working', 'won\'t', 'doesn\'t', 'issue', 'problem', 'what should', 'what do', 'can i', 'how to', 'need', 'want'];
  const hasRepairRequest = repairRequestIndicators.some((r) => q.includes(r));
  const symptomWords = ['makes noise', 'making noise', 'smells', 'smelling', 'sound', 'noise', 'leaking', 'dripping', 'buzzing', 'flickering', 'hot', 'warm', 'cold', 'wet'];
  if (!hasRepairRequest && symptomWords.some((s) => q.includes(s))) {
    return { intent: 'symptom_describe' };
  }

  // Diagnosis
  const diagnosisWords = ['what is causing', 'why is this', 'what caused', 'diagnosis', 'root cause', 'what\'s wrong', 'what happened'];
  if (diagnosisWords.some((d) => q.includes(d))) {
    return { intent: 'diagnosis' };
  }

  // Step-by-step
  const stepWords = ['step by step', 'steps', 'how to fix', 'instructions', 'walk me through', 'guide me', 'detailed guide'];
  if (stepWords.some((s) => q.includes(s))) {
    return { intent: 'step_by_step' };
  }

  // Quick fix / temporary
  const quickFixWords = ['quick fix', 'temporary', 'for now', 'band aid', 'workaround', 'patch', 'quick'];
  if (quickFixWords.some((k) => q.includes(k))) {
    return { intent: 'quick_fix' };
  }

  // Tools needed
  const toolsWords = ['tools', 'what do i need', 'equipment', 'supplies', 'materials', 'wrench', 'screwdriver'];
  if (toolsWords.some((t) => q.includes(t))) {
    return { intent: 'tools_needed' };
  }

  // Difficulty
  const difficultyWords = ['hard', 'difficult', 'easy', 'simple', 'complicated', 'beginner', 'can i do this', 'diy', 'myself'];
  if (difficultyWords.some((d) => q.includes(d))) {
    return { intent: 'difficulty' };
  }

  // Time estimate
  const timeWords = ['how long', 'time', 'minutes', 'hours', 'quick', 'slow'];
  if (timeWords.some((t) => q.includes(t))) {
    return { intent: 'time_estimate' };
  }

  // Cost estimate
  const costWords = ['cost', 'price', 'expensive', 'cheap', 'money', 'how much', 'budget'];
  if (costWords.some((c) => q.includes(c))) {
    return { intent: 'cost_estimate' };
  }

  // Safety check
  const safetyWords = ['dangerous', 'safe', 'safety', 'hurt', 'shock', 'risk', 'should i call'];
  if (safetyWords.some((s) => q.includes(s))) {
    return { intent: 'safety_check' };
  }

  // Replace vs fix
  const replaceWords = ['replace', 'repair', 'buy new', 'fix or', 'worth fixing'];
  if (replaceWords.some((r) => q.includes(r))) {
    return { intent: 'replace_vs_fix' };
  }

  // Compare
  const compareWords = ['which is better', 'compare', 'difference between', 'vs', 'versus', 'best option'];
  if (compareWords.some((c) => q.includes(c))) {
    return { intent: 'compare_solutions' };
  }

  // Context intents
  const followUpWords = ['what about', 'and also', 'another', 'also', 'plus', 'in addition'];
  if (followUpWords.some((f) => q.includes(f)) && words.length < 8) {
    return { intent: 'follow_up' };
  }

  const clarifyWords = ['what do you mean', 'explain', 'clarify', 'i don\'t understand', 'confused'];
  if (clarifyWords.some((c) => q.includes(c))) {
    return { intent: 'clarification' };
  }

  const rephraseWords = ['simpler', 'simplify', 'easier', 'rephrase', 'say again', 'repeat', 'another way'];
  if (rephraseWords.some((r) => q.includes(r))) {
    return { intent: 'rephrase' };
  }

  const summarizeWords = ['short version', 'summary', 'tl;dr', 'quick summary', 'brief'];
  if (summarizeWords.some((s) => q.includes(s))) {
    return { intent: 'summarize' };
  }

  // Real-world intents
  const partsWords = ['where to buy', 'parts', 'spare', 'replacement', 'store', 'hardware'];
  if (partsWords.some((p) => q.includes(p))) {
    return { intent: 'find_parts' };
  }

  const brandWords = ['samsung', 'lg', 'whirlpool', 'toyota', 'honda', 'ford', 'iphone', 'samsung phone', 'dell', 'hp'];
  if (brandWords.some((b) => q.includes(b))) {
    return { intent: 'brand_specific' };
  }

  const modelWords = ['vios', 'civic', 'corolla', 'altis', 'model', 'year', '2018', '2019', '2020'];
  if (modelWords.some((m) => q.includes(m))) {
    return { intent: 'model_specific' };
  }

  const locationWords = ['near me', 'nearby', 'find fixer', 'local', 'service center', 'repair shop'];
  if (locationWords.some((l) => q.includes(l))) {
    return { intent: 'location_help' };
  }

  const preventiveWords = ['prevent', 'avoid', 'maintenance', 'stop', 'regular', 'how often', 'upkeep'];
  if (preventiveWords.some((p) => q.includes(p))) {
    return { intent: 'preventive' };
  }

  const confidenceWords = ['are you sure', 'certain', 'confident', 'really', 'think so'];
  if (confidenceWords.some((c) => q.includes(c))) {
    return { intent: 'confidence_check' };
  }

  const alternativeWords = ['another way', 'different', 'other option', 'alternative', 'else can i', 'instead'];
  if (alternativeWords.some((a) => q.includes(a))) {
    return { intent: 'alternative_solution' };
  }

  // Multi-issue detection
  const multiIssueMarkers = ['and', 'also', 'plus', 'as well', 'both', 'another'];
  const issueCount = multiIssueMarkers.filter((m) => q.includes(m)).length;
  if (issueCount >= 1 && (q.includes('leak') || q.includes('not working') || q.includes('broken') || q.includes('problem'))) {
    return { intent: 'multi_issue' };
  }

  // Offtopic
  const offtopicWords = ['weather', 'news', 'politics', 'sports', 'movie', 'music', 'game', 'food recipe', 'cook', 'math', 'calculate', 'translate', 'stock', 'crypto', 'bitcoin'];
  const repairDomainWords = ['fix', 'repair', 'broken', 'leak', 'problem', 'issue', 'not working', 'won\'t', 'doesn\'t', 'help', 'how to', 'troubleshoot', 'faucet', 'pipe', 'toilet', 'car', 'phone', 'laptop', 'washer', 'fridge', 'battery', 'tire', 'oil', 'charger', 'router', 'wifi', 'internet', 'screen', 'door', 'window', 'wall', 'paint', 'light', 'outlet', 'breaker'];
  const hasOfftopic = offtopicWords.some((o) => q.includes(o));
  const hasRepair = repairDomainWords.some((r) => q.includes(r));
  if (hasOfftopic && !hasRepair) {
    return { intent: 'offtopic' };
  }

  return { intent: 'expert' };
}

function getGreetingReply(): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetings = [
    `${timeGreeting}! I'm **Kumpuni AI**, your home repair assistant. I can help you troubleshoot issues with plumbing, electrical, appliances, cars, and electronics. What are you dealing with today?`,
    `Hey there! Ready to help you fix things around the house. Whether it's a **leaky faucet**, a **car that won't start**, or a **phone that won't charge** — just describe what's happening and I'll find the right guide for you.`,
    `Hello! I'm here to make home repairs less stressful. Tell me about the problem you're facing, and I'll search through my repair guides to point you in the right direction.`,
    `Hi! Got a broken something at home? I'm Kumpuni AI — I help with plumbing, electrical, appliances, cars, and electronics. What's going on?`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getThanksReply(): string {
  const replies = [
    `You're very welcome! If you run into anything else, I'm right here.`,
    `Glad I could help! Don't hesitate to ask if you need more guidance.`,
    `Anytime! Hope the repair goes smoothly. Let me know how it turns out.`,
    `Happy to help! Feel free to come back anytime you need a hand.`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getGoodbyeReply(): string {
  const replies = [
    `Take care! Good luck with the repair.`,
    `See you later! Hope everything works out.`,
    `Bye for now! Reach out anytime you need help around the home.`,
    `Goodbye! Hope your fix goes well. Chat again if you need anything!`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getIdentityReply(): string {
  return `I'm **Kumpuni AI**, an intelligent repair assistant built into the Kumpuni app. I was developed by the Kumpuni team to help people troubleshoot and fix things around their home, car, and devices.\n\n**What I know:**\n- Plumbing, electrical, painting, and drywall repairs\n- Appliance troubleshooting (washers, fridges, ACs, microwaves)\n- Car basics (battery, tires, fluids, warning lights)\n- Electronics (phones, laptops, routers, charging issues)\n\n**What I don't do:**\n- Weather, news, jokes (well, maybe a small one 😉), or general chat\n- I focus on repairs and maintenance to give you the best, most accurate guidance possible.\n\nGot something broken? Describe it and I'll find the right guide for you!`;
}

function getJokeReply(): string {
  const jokes = [
    `Why did the plumber break up with the electrician? There was no spark between them! ⚡💔`,
    `I told my wife she was drawing her eyebrows too high. She looked surprised. 🎨`,
    `Why don't scientists trust atoms? Because they make up everything! ⚛️`,
    `I have a joke about construction, but I'm still working on it. 🏗️`,
    `Why did the scarecrow win an award? Because he was outstanding in his field! 🌾`,
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return `${joke}\n\nNow, back to fixing things! What can I help you repair today? 🔧`;
}

function getOfftopicReply(): string {
  return `Hmm, that sounds like it might be outside my repair expertise! I'm **Kumpuni AI**, and I specialize in helping you fix things around the home, car, and devices.\n\nI can help with:\n• **Plumbing** — leaky faucets, clogged drains, toilet issues\n• **Electrical** — outlets, breakers, light fixtures\n• **Appliances** — washers, fridges, ACs, microwaves\n• **Car** — battery, tires, fluids, warning lights\n• **Electronics** — phones, laptops, routers, chargers\n\nIs there something broken or not working that I can help you troubleshoot?`;
}

function getCapabilitiesReply(): string {
  return `I'm **Kumpuni AI**, your personal home repair assistant. Here's what I can do for you:\n\n**🔍 Troubleshoot problems** — Describe what's broken or acting weird, and I'll analyze your issue and find the most relevant repair guide.\n\n**📋 Step-by-step guides** — I have detailed instructions for plumbing, electrical work, appliances, car maintenance, and electronics.\n\n**⚠️ Safety first** — Every guide includes safety warnings and tells you when it's time to call a professional instead of DIY.\n\n**🧑‍🔧 Pro fixers** — If your issue is too complex or dangerous, I can connect you with a **local fixer** through the Fixers tab.\n\n**Quick tips:** Try asking "how do I fix a leaky faucet?" or "my car won't start" and I'll get straight to the answer!`;
}

function getComplexFallbackReply(): string {
  return `This sounds like a more complex issue that might need hands-on expertise. While I can point you to general guides, I'd recommend **consulting with a professional fixer** for this one.\n\nYou can browse available fixers in the **Fixers** tab — they specialize in everything from plumbing and electrical to car repair and appliance service. They'll be able to assess your situation in person and give you a proper solution.\n\nIn the meantime, can you tell me more about the symptoms? Any sounds, smells, error lights, or recent changes?`;
}

/* ─── New intent reply generators ─────────────────────── */

function getDeveloperReply(): string {
  return `I was developed by the **Kumpuni team** — a group of developers, designers, and home repair enthusiasts who wanted to make DIY repairs more accessible for everyone.\n\n**About Kumpuni:**\n- Built to help homeowners and renters fix common problems without calling expensive professionals for every little thing\n- Combines expert repair knowledge with an easy-to-use AI assistant\n- Also connects you with verified local **fixers** when DIY isn't enough\n\nThe team is constantly improving me with new guides, better matching, and smarter responses. If you have feedback, we'd love to hear it through the Settings page!`;
}

function getEmergencyReply(): string {
  return `🚨 **This sounds like an emergency situation.**\n\nPlease prioritize your safety:\n\n1. **If there's fire, sparks, or gas smell** — evacuate immediately and call emergency services\n2. **If water is flooding** — turn off the main water valve if it's safe to reach\n3. **If electrical shock risk** — turn off the main breaker from a dry location\n\nI'm not equipped to handle real-time emergencies. Please contact:\n• Emergency services (911/112) for life-threatening situations\n• A licensed professional for urgent repairs\n• Your utility company for gas or major electrical issues\n\nOnce the immediate danger is resolved, I can help you understand what caused it and how to prevent it in the future.`;
}

function getSymptomReply(): string {
  const replies = [
    `Thanks for describing the symptoms! That helps me narrow things down. Let me search for guides that match what you're experiencing.`,
    `Symptom descriptions are super helpful. Based on what you're describing, let me find the most relevant repair guide.`,
    `Got it — that symptom profile is useful. Let me analyze this and find matching guides for you.`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getDiagnosisReply(query: string, guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Based on your description, the most likely cause is related to **${top.title}**. Here's my best-matching guide to help you confirm and fix it:`;
  }
  return `To diagnose this properly, I'd need a bit more detail. Can you tell me:\n\n• When did the problem start?\n• Any recent changes or events?\n• Specific sounds, smells, or visual signs?\n• Is it consistent or intermittent?`;
}

function getStepByStepReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Here are the step-by-step instructions for **${top.title}**. Tap the guide card below to see the full detailed walkthrough with tools, safety notes, and estimated time:`;
  }
  return `I'd be happy to walk you through step-by-step! First, can you tell me what specific repair you're trying to do? For example: **leaky faucet**, **car not starting**, or **outlet not working**?`;
}

function getQuickFixReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `Here's a quick, temporary fix for **${top.title}** to tide you over until you can do a proper repair. Tap the guide card below for the full instructions — look for the "Quick Fix" section at the top:`;
  }
  return `I can suggest temporary fixes if I know the exact issue. Can you describe what's happening in more detail? For example: **leaking from the base**, **won\'t turn on**, or **making noise**?`;
}

function getToolsNeededReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top && (top as any).tools) {
    const tools = (top as any).tools as string[];
    return `For **${top.title}**, you'll typically need:\n\n${tools.map((t: string) => `• ${t}`).join('\n')}\n\nYou can find most of these at any hardware store. Tap the guide card below to see the full tool list and step-by-step instructions.`;
  }
  return `Tool requirements depend on the specific repair. Tell me what you're fixing and I'll list exactly what you need!`;
}

function getDifficultyReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `For **${top.title}**, most people with basic tools and patience can handle this. The step-by-step guide breaks everything down clearly. If any step feels unsafe or unclear, that's when to call a pro. Tap the card below to see the full instructions!`;
  }
  return `Difficulty depends on the repair. Tell me what you're dealing with and I'll give you an honest assessment!`;
}

function getTimeEstimateReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `**${top.title}** typically takes about **30–90 minutes** for most people. Simple issues can be under 30 min; unexpected complications might push it to 2+ hours. This assumes you have the right tools and don't run into unexpected issues. Tap the guide below for the full breakdown.`;
  }
  return `Time estimates vary by repair. What are you working on? I'll give you a realistic timeframe.`;
}

function getCostEstimateReply(): string {
  return `Cost varies a lot depending on your location, parts quality, and whether you DIY or hire someone.\n\n**DIY range:** ₱200–₱2,000 (parts + tools)\n**Pro fixer:** ₱500–₱5,000 depending on complexity\n\nTap any guide card for a more specific estimate, or browse the **Fixers** tab to get a quote from a local pro.`;
}

function getSafetyCheckReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top && top.safetyNotes) {
    return `For **${top.title}**, here are the key safety points:\n\n⚠️ ${top.safetyNotes}\n\nAlways follow these — safety first! Full details in the guide below:`;
  }
  return `I always include safety warnings in every guide. Most common hazards:\n\n• **Electrical** — turn off power at the breaker\n• **Water** — shut off the main valve first\n• **Chemicals** — wear gloves and ventilate\n\nTap any repair guide to see detailed safety notes for your specific issue.`;
}

function getReplaceVsFixReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `That's a smart question! For **${top.title}**, here's the rule of thumb:\n\n**Repair if:** The part is expensive, the fix is simple, and the unit is under 5–7 years old.\n**Replace if:** Multiple parts are failing, repair costs >50% of replacement, or it's very old.\n\nTap the guide below to see the specific factors for your situation.`;
  }
  return `Generally: **repair** if it's a simple fix on a relatively new item. **Replace** if it's old, repair costs are high, or multiple things are failing. Tell me the specific item and I can give you a better answer!`;
}

function getCompareReply(): string {
  return `To compare options, I need to know the two solutions you're considering. For example:\n\n• **DIY vs. hiring a pro**\n• **Patch vs. replace**\n• **Temporary fix vs. permanent repair**\n\nTell me what you're weighing and I'll break down the pros and cons!`;
}

function getFollowUpReply(lastTopic: string | null): string {
  if (lastTopic) {
    return `Got it — following up on **${lastTopic}**. Let me search for more specific guidance on that.`;
  }
  return `Could you remind me what we were discussing? I want to make sure I give you the right follow-up advice.`;
}

function getClarificationReply(): string {
  return `Sorry if that wasn't clear! Let me rephrase:\n\nI analyze your repair description, match it to our repair guides, and present the most relevant one as a card you can tap for full step-by-step instructions.\n\nThink of me as a smart repair book that finds the right page for you. What problem are you trying to solve?`;
}

function getRephraseReply(): string {
  return `Got it — simpler version:\n\nTell me what's broken or acting weird → I find the best repair guide → you follow the steps. That's it!\n\nWhat are you dealing with right now?`;
}

function getSummarizeReply(): string {
  return `**TL;DR:** Describe your problem → I find the right repair guide → you fix it. Need a pro? Use the **Fixers** tab.\n\nWhat do you need help with?`;
}

function getFindPartsReply(): string {
  return `You can find repair parts at:\n\n• **Hardware stores** — Ace Hardware, True Value, Wilcon\n• **Online** — Lazada, Shopee (search by part number)\n• **Authorized service centers** — for brand-specific parts (Samsung, LG, etc.)\n• **Auto parts shops** — for car repairs\n\nTap any guide card and check the **Tools & Materials** section for exact part names and model numbers.`;
}

function getBrandSpecificReply(): string {
  return `While I have general repair guides, brand-specific repairs often need exact part numbers and disassembly steps.\n\n**My guides cover:** Common issues across most brands\n**For exact brand fixes:** Check your manual or contact the brand service center\n\nDescribe the **symptoms** (not working, error code, noise) and I'll match you to the most relevant general guide.`;
}

function getModelSpecificReply(): string {
  return `Model-specific repairs usually need exact schematics and part numbers. My guides cover the **most common issues** across similar models.\n\nTell me the **symptoms** you're seeing — not working, error lights, strange sounds, leaks — and I'll match you to the right troubleshooting guide.`;
}

function getLocationHelpReply(): string {
  return `You can find trusted local repair pros in the **Fixers** tab of the app!\n\nBrowse by category:\n• Plumbing & Electrical\n• Appliances & HVAC\n• Car & Motorcycle\n• Electronics & Gadgets\n\nEach fixer has ratings, reviews, and estimated rates. You can message them directly through the app!`;
}

function getPreventiveReply(): string {
  return `Prevention is the best repair! Here are universal tips:\n\n• **Plumbing** — Don't pour grease down drains; check for leaks monthly\n• **Electrical** — Don't overload outlets; replace frayed cords immediately\n• **Appliances** — Clean filters/coils regularly; don't ignore small noises\n• **Car** — Follow maintenance schedule; check fluids monthly\n• **Electronics** — Keep devices dry and ventilated; use surge protectors\n\nRegular maintenance prevents 80% of emergency repairs. What area do you want to maintain better?`;
}

function getMultiIssueReply(): string {
  return `Sounds like you have multiple issues at once! Let me help you prioritize:\n\n1. **Safety first** — any gas leaks, sparks, or flooding? Handle those immediately.\n2. **Biggest impact** — which problem affects your daily life most?\n3. **Causation** — sometimes one fix solves multiple symptoms\n\nTell me each issue one at a time and I'll match you to the right guide for each. Which one is most urgent?`;
}

function getConfidenceCheckReply(guides: ScoredGuide[]): string {
  const top = guides[0];
  if (top) {
    return `I'm about **${Math.round(top.score)}% confident** that **${top.title}** is the right match for your description.\n\nMy confidence comes from matching your keywords to the guide title, symptoms, and steps. If this doesn't feel right, describe the issue in more detail — sounds, smells, exact location, when it started — and I'll search again!`;
  }
  return `To be more confident, I need more details from you:\n\n• Exact location (kitchen faucet vs. bathroom faucet)\n• When did it start?\n• Any sounds, smells, or error messages?\n• Recent changes (new installation, storm, etc.)?\n\nThe more specific you are, the better I can match you!`;
}

function getAlternativeSolutionReply(guides: ScoredGuide[]): string {
  if (guides.length > 1) {
    const alt = guides[1];
    return `Here's an alternative approach: **${alt.title}** might also fit your situation. Some issues have multiple possible causes. Tap the second guide card below to compare!`;
  }
  return `I only found one strong match for your description. If that doesn't feel right, try rephrasing with different keywords — or tell me more symptoms and I'll search again!`;
}

/* ─── Expert reply generator ──────────────────────────── */
function generateExpertReply(query: string, guides: ScoredGuide[]): string {
  // Check for danger combos first
  const danger = detectDanger(query);
  if (danger.isDangerous && danger.warning) {
    return danger.warning;
  }

  // Expand query with synonyms for better matching
  const q = query.toLowerCase();
  let expandedQuery = q;
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (q.includes(key)) {
      expandedQuery += ' ' + synonyms.join(' ');
    }
  }

  const top = guides[0];
  const score = top?.score ?? 0;
  const title = top?.title ?? '';
  const lowerQ = query.toLowerCase();

  const uncertaintyWords = ['don\'t know', 'not sure', 'maybe', 'something', 'weird', 'strange', 'what is', 'why'];
  const isUncertain = uncertaintyWords.some((w) => lowerQ.includes(w));
  const isQuestion = lowerQ.includes('?') || /^(how|what|why|is|does|can|will)/.test(lowerQ);

  if (score >= 100) {
    if (isUncertain && isQuestion) {
      return `It sounds like you might be dealing with a **${title.toLowerCase()}** issue. Here's the guide that should help:`;
    }
    if (isQuestion) {
      return `Great question! Here's a guide on **${title.toLowerCase()}** that should answer that:`;
    }
    return `Based on what you're describing, it sounds like a **${title.toLowerCase()}** problem. Here's what I found:`;
  }

  if (score >= 50) {
    return `I'm fairly confident this guide on **${title.toLowerCase()}** is what you're looking for:`;
  }

  if (score >= 25) {
    return `This guide on **${title.toLowerCase()}** might be relevant. Take a look:`;
  }

  const suggestions = getSuggestedCategories(lowerQ);
  if (suggestions.length > 0) {
    const catNames = suggestions.map((c) => `**${CATEGORY_LABELS[c] || c}**`).join(', ');
    return `I see this might be about ${catNames}. Could you describe the symptoms more specifically? What exactly happens — any sounds, smells, or error signs?`;
  }

  return `I\'m not sure I have a guide for that. Could you tell me if it\'s related to **plumbing**, **electrical**, **appliances**, **car**, or **electronics**?`;
}

/* ─── Confidence badge color ──────────────────────────── */
function confidenceBadge(conf: 'high' | 'medium' | 'low') {
  switch (conf) {
    case 'high': return { label: 'Best match', color: '#10B981', bg: '#ECFDF5' };
    case 'medium': return { label: 'Likely match', color: '#F59E0B', bg: '#FFFBEB' };
    case 'low': return { label: 'Maybe helpful', color: '#6B7280', bg: '#F3F4F6' };
  }
}

/* ─── Main screen ─────────────────────────────────────── */
export default function AIAssistantScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [lastCategory, setLastCategory] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { photo } = useLocalSearchParams<{ photo?: string }>();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    if (photo) {
      setMessages([
        { id: uid('photo-user-'), role: 'user', text: 'I took a photo of the issue. Can you help?', photoUri: photo },
      ]);
      runExpertQuery('leak from photo', 'photo-');
    }
  }, [photo]);

  const runExpertQuery = (query: string, idPrefix = '') => {
    const thinkId = uid('think-');
    const aiId = uid(idPrefix);

    setTypingIds((prev) => new Set(prev).add(thinkId));
    scrollToBottom();

    setTimeout(() => {
      // Check non-expert intents first (greetings, thanks, etc.)
      const { intent } = detectIntent(query);

      let reply: string;
      let guides: ScoredGuide[] | undefined;

      switch (intent) {
        case 'greeting':
          reply = getGreetingReply();
          break;
        case 'thanks':
          reply = getThanksReply();
          break;
        case 'goodbye':
          reply = getGoodbyeReply();
          break;
        case 'capabilities':
          reply = getCapabilitiesReply();
          break;
        case 'identity':
          reply = getIdentityReply();
          break;
        case 'developer':
          reply = getDeveloperReply();
          break;
        case 'joke':
          reply = getJokeReply();
          break;
        case 'offtopic':
          reply = getOfftopicReply();
          break;
        case 'profanity':
          reply = getProfanityReply();
          break;
        case 'emergency':
          reply = getEmergencyReply();
          break;
        case 'symptom_describe':
          reply = getSymptomReply();
          break;
        case 'diagnosis': {
          const results = findBestGuides(query, 3);
          reply = getDiagnosisReply(query, results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'step_by_step': {
          const results = findBestGuides(query, 3);
          reply = getStepByStepReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'quick_fix': {
          const results = findBestGuides(query, 3);
          reply = getQuickFixReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'tools_needed': {
          const results = findBestGuides(query, 3);
          reply = getToolsNeededReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'difficulty': {
          const results = findBestGuides(query, 3);
          reply = getDifficultyReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'time_estimate': {
          const results = findBestGuides(query, 3);
          reply = getTimeEstimateReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'cost_estimate':
          reply = getCostEstimateReply();
          break;
        case 'safety_check': {
          const results = findBestGuides(query, 3);
          reply = getSafetyCheckReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'replace_vs_fix': {
          const results = findBestGuides(query, 3);
          reply = getReplaceVsFixReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'compare_solutions':
          reply = getCompareReply();
          break;
        case 'follow_up':
          reply = getFollowUpReply(lastTopic);
          break;
        case 'clarification':
          reply = getClarificationReply();
          break;
        case 'rephrase':
          reply = getRephraseReply();
          break;
        case 'summarize':
          reply = getSummarizeReply();
          break;
        case 'find_parts':
          reply = getFindPartsReply();
          break;
        case 'brand_specific':
          reply = getBrandSpecificReply();
          break;
        case 'model_specific':
          reply = getModelSpecificReply();
          break;
        case 'location_help':
          reply = getLocationHelpReply();
          break;
        case 'preventive':
          reply = getPreventiveReply();
          break;
        case 'multi_issue':
          reply = getMultiIssueReply();
          break;
        case 'confidence_check': {
          const results = findBestGuides(query, 3);
          reply = getConfidenceCheckReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'alternative_solution': {
          const results = findBestGuides(query, 3);
          reply = getAlternativeSolutionReply(results);
          guides = results.length > 0 ? results : undefined;
          break;
        }
        case 'expert':
        default: {
          // Entity extraction for better matching
          const entities = extractEntities(query);
          const danger = detectDanger(query);

          if (danger.isDangerous && danger.warning) {
            reply = danger.warning;
            break;
          }

          // Build expanded query with synonyms
          let expandedQuery = query;
          const qLower = query.toLowerCase();
          for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
            if (qLower.includes(key)) {
              expandedQuery += ' ' + synonyms.join(' ');
            }
          }

          const results = findBestGuides(expandedQuery, 3);

          // If no good match and query seems complex, suggest fixer
          if (results.length === 0 && query.length > 40) {
            reply = getComplexFallbackReply();
          } else {
            reply = generateExpertReply(query, results);
            guides = results.length > 0 ? results : undefined;
          }

          // Update conversation memory
          if (guides && guides.length > 0) {
            setLastTopic(guides[0].title);
            if (entities.category) setLastCategory(entities.category);
          }
          break;
        }
      }

      setTypingIds((prev) => {
        const next = new Set(prev);
        next.delete(thinkId);
        next.add(aiId);
        return next;
      });

      const aiMsg: Message = {
        id: aiId,
        role: 'ai',
        text: reply,
        guides,
      };

      setMessages((prev) => [...prev, aiMsg]);
      scrollToBottom();

      // Remove typing flag after stream completes (~1s)
      setTimeout(() => {
        setTypingIds((prev) => {
          const next = new Set(prev);
          next.delete(aiId);
          return next;
        });
      }, reply.length * 18 + 200);
    }, 900 + Math.random() * 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    runExpertQuery(text);
  };

  const handleReset = () => {
    setMessages([]);
    setTypingIds(new Set());
    setLastTopic(null);
    setLastCategory(null);
    setInput('');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleChip = (text: string) => {
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    runExpertQuery(text, 'chip-');
  };

  const handleSuggestion = (text: string) => {
    const userMsg: Message = { id: uid('user-'), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    runExpertQuery(text, 'suggest-');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={scrollToBottom}
        >
          {/* Hero */}
          <View style={styles.heroCard}>
            <Image
              source={require('@/assets/images/assistant.png')}
              style={{ width: 100, height: 100, marginLeft: -8, marginBottom: -12 }}
              resizeMode="contain"
            />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>AI Assistant</Text>
              <Text style={styles.heroSub}>Describe your problem and I'll find the right guide for you.</Text>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
              <RotateCcw size={18} color="#6DBE75" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <View key={msg.id} style={{ marginBottom: 4 }}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                  {msg.photoUri && (
                    <Image source={{ uri: msg.photoUri }} style={styles.capturedPhoto} />
                  )}
                </View>
              );
            }

            const isTyping = typingIds.has(msg.id);

            return (
              <View key={msg.id} style={{ marginBottom: 6 }}>
                {/* AI Reply bubble */}
                <View style={styles.aiBubble}>
                  <View style={styles.aiImageWrap}>
                    <Image
                      source={require('@/assets/images/AI.png')}
                      style={{ width: 28, height: 28 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {isTyping ? (
                      <TypewriterText
                        text={msg.text ?? ''}
                        onDone={scrollToBottom}
                        onProgress={scrollToBottom}
                      />
                    ) : (
                      <Text style={styles.aiText}>
                        <MarkdownText text={msg.text ?? ''} />
                      </Text>
                    )}
                  </View>
                </View>

                {/* Compact guide cards - only show after streaming finishes */}
                {msg.guides && !typingIds.has(msg.id) && msg.guides.map((guide) => {
                  const badge = confidenceBadge(guide.confidence);
                  const CatIcon = CATEGORY_ICONS[guide.categoryId] || Zap;
                  const catColor = CATEGORY_COLORS[guide.categoryId] || '#6DBE75';
                  return (
                    <TouchableOpacity
                      key={guide.id}
                      style={[styles.resultCard, { borderLeftColor: catColor }]}
                      activeOpacity={0.85}
                      onPress={() => router.push(`/guide/${guide.id}` as any)}
                    >
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardTitleRow}>
                          <CatIcon size={14} color={catColor} strokeWidth={2.5} />
                          <Text style={styles.resultTitle}>{guide.title}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.resultOverview} numberOfLines={2}>
                        {guide.overview}
                      </Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.catLabel}>{CATEGORY_LABELS[guide.categoryId] || guide.categoryId}</Text>
                        <View style={styles.viewLink}>
                          <Text style={styles.viewLinkText}>View Guide</Text>
                          <ArrowRight size={14} color="#6DBE75" strokeWidth={2.5} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}

          {/* Thinking indicator */}
          {Array.from(typingIds).some((id) => id.startsWith('think-')) && (
            <View style={styles.thinkingRow}>
              <View style={styles.aiImageWrapSmall}>
                <Image
                  source={require('@/assets/images/AI.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.thinkingBubble}>
                <TypingDots />
              </View>
            </View>
          )}

          {/* Did-you-mean suggestion chips after low-confidence responses */}
          {(() => {
            const lastAi = [...messages].reverse().find((m) => m.role === 'ai');
            if (!lastAi || !lastAi.guides || lastAi.guides.length === 0) return null;
            if (lastAi.guides[0].confidence === 'high') return null;
            return (
              <View style={styles.suggestWrap}>
                <Text style={styles.suggestLabel}>Or try:</Text>
                <View style={styles.chipsRow}>
                  {lastAi.guides.slice(0, 2).map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.suggestChip, { borderColor: CATEGORY_COLORS[g.categoryId] || '#E5E7EB' }]}
                      activeOpacity={0.7}
                      onPress={() => handleSuggestion(g.title)}
                    >
                      <Text style={styles.suggestChipText}>{g.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })()}

          {/* Quick chips when empty */}
          {messages.length === 0 && (
            <View style={styles.chipsRow}>
              {CHIPS.map((chip, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  activeOpacity={0.7}
                  onPress={() => handleChip(chip)}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Describe your issue..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.micBtn} activeOpacity={0.7}>
            <Mic size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8} onPress={handleSend}>
            <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  scroll: { paddingHorizontal: 20, paddingBottom: 220, paddingTop: 4 },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6DBE75',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
    marginBottom: 4,
  },
  userText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },

  aiBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  aiImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiImageWrapSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
    paddingTop: 6,
  },

  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  thinkingBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 2 },
  heroSub: { fontSize: 12, lineHeight: 18, color: '#6B7280' },

  capturedPhoto: { width: '100%', height: 180, borderRadius: 16, marginTop: 6, marginBottom: 6 },

  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },

  /* Compact result cards */
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    marginLeft: 46,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  resultOverview: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6DBE75',
  },

  /* Suggestions */
  suggestWrap: { marginLeft: 46, marginBottom: 12 },
  suggestLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 6 },

  /* Chips */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chipText: { fontSize: 12, fontWeight: '500', color: '#374151' },

  suggestChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
  },
  suggestChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },

  /* Input */
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 14, color: '#1F2937', maxHeight: 80, paddingVertical: 6 },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6DBE75',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
