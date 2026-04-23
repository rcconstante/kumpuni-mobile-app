import { PROFANITY_LIST } from './constants';
import { ExtractedEntity, Intent } from './types';

export function detectProfanity(query: string): boolean {
  const q = query.toLowerCase();
  return PROFANITY_LIST.some((w) => q.includes(w));
}

export function extractEntities(query: string): ExtractedEntity {
  const q = query.toLowerCase();
  let category: string | null = null;
  let object: string | null = null;
  let symptom: string | null = null;
  let severity: 'low' | 'medium' | 'high' | null = null;
  let urgency: 'low' | 'medium' | 'high' | null = null;

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

  const objects = [
    'faucet',
    'sink',
    'toilet',
    'pipe',
    'drain',
    'shower',
    'washer',
    'fridge',
    'ac',
    'microwave',
    'car',
    'battery',
    'tire',
    'phone',
    'laptop',
    'router',
    'outlet',
    'breaker',
    'light',
    'screen',
    'door',
    'window',
    'wall',
    'charger',
  ];
  for (const obj of objects) {
    if (q.includes(obj)) {
      object = obj;
      break;
    }
  }

  const symptoms = ['leak', 'drip', 'clog', 'not working', 'broken', 'noise', 'smell', 'hot', 'cold', 'slow', 'fast', 'dead', 'crack', 'flicker'];
  for (const s of symptoms) {
    if (q.includes(s)) {
      symptom = s;
      break;
    }
  }

  if (q.includes('emergency') || q.includes('dangerous') || q.includes('fire') || q.includes('sparks') || q.includes('everywhere')) {
    severity = 'high';
    urgency = 'high';
  } else if (q.includes('urgent') || q.includes('quick') || q.includes('soon')) {
    severity = 'medium';
    urgency = 'high';
  } else if (q.includes('slowly') || q.includes('minor') || q.includes('small')) {
    severity = 'low';
    urgency = 'low';
  }

  return { category, object, symptom, severity, urgency };
}

export function detectDanger(query: string): { isDangerous: boolean; warning: string | null } {
  const q = query.toLowerCase();
  const dangerCombos = [
    {
      keywords: ['water', 'electric'],
      warning:
        '**⚠️ DANGER: Water + Electricity**\n\nThis is a serious safety hazard. Do NOT touch any electrical outlets, switches, or appliances near water. Turn off the main breaker immediately and call a licensed electrician or emergency services.',
    },
    {
      keywords: ['gas', 'smell'],
      warning:
        '**⚠️ DANGER: Possible Gas Leak**\n\nIf you smell gas, do NOT use any electrical switches or open flames. Leave the area immediately and call your gas company or emergency services from outside.',
    },
    {
      keywords: ['sparks', 'smoke'],
      warning:
        '**⚠️ DANGER: Electrical Fire Risk**\n\nSparks or smoke from electrical components are extremely dangerous. Turn off the breaker for that circuit immediately. Do NOT attempt DIY repairs. Call an electrician right away.',
    },
    {
      keywords: ['roof', 'collapse'],
      warning:
        '**⚠️ DANGER: Structural Issue**\n\nThis could be a structural safety concern. Evacuate the area if necessary and contact a professional contractor immediately.',
    },
  ];

  for (const combo of dangerCombos) {
    if (combo.keywords.every((k) => q.includes(k))) {
      return { isDangerous: true, warning: combo.warning };
    }
  }

  return { isDangerous: false, warning: null };
}

export function detectIntent(query: string): { intent: Intent; detail?: string } {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  if (detectProfanity(q)) {
    return { intent: 'profanity' };
  }

  const emergencyWords = ['emergency', 'urgent', 'flooding', 'fire', 'sparks', 'smoke', 'gas leak', 'electrocution', 'danger'];
  if (emergencyWords.some((e) => q.includes(e))) {
    return { intent: 'emergency' };
  }

  const greetingWords = ['good morning', 'good afternoon', 'good evening', 'greetings', 'what\'s up', 'howdy'];
  if (greetingWords.some((g) => q.includes(g))) return { intent: 'greeting' };

  const standaloneGreetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'hiya'];
  const wordsOnly = q.split(/[^a-z]+/).filter(Boolean);
  if (standaloneGreetings.some((g) => wordsOnly.includes(g))) return { intent: 'greeting' };

  const thanksWords = ['thank', 'thanks', 'appreciate', 'grateful', 'cheers', 'ty', 'thx', 'nice', 'awesome', 'great'];
  const cleanWords = q.replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 1);
  if (thanksWords.some((t) => cleanWords.includes(t))) {
    return { intent: 'thanks' };
  }

  const goodbyeWords = ['bye', 'goodbye', 'see you', 'cya', 'later', 'take care', 'night', 'sleep'];
  if (goodbyeWords.some((g) => q.includes(g))) {
    return { intent: 'goodbye' };
  }

  const identityWords = ['who are you', 'what are you', 'who made you', 'who created you', 'about you', 'tell me about', 'your name', 'are you human', 'are you ai', 'are you real'];
  if (identityWords.some((i) => q.includes(i))) {
    return { intent: 'identity' };
  }

  const devWords = ['developer', 'who built you', 'who programmed you', 'who made this app', 'who owns', 'who owns kumpuni', 'creator', 'team behind'];
  if (devWords.some((d) => q.includes(d))) {
    return { intent: 'developer' };
  }

  const jokeWords = ['joke', 'funny', 'laugh', 'humor', 'make me laugh', 'tell me a joke', 'bored'];
  if (jokeWords.some((j) => q.includes(j))) {
    return { intent: 'joke' };
  }

  const capWords = ['what can you do', 'what do you do', 'how do you work', 'capabilities', 'features', 'help me', 'how does this work', 'what should i ask'];
  if (capWords.some((c) => q.includes(c)) || (words.includes('what') && words.includes('do') && words.length < 6)) {
    return { intent: 'capabilities' };
  }

  const repairRequestIndicators = ['fix', 'repair', 'help', 'how', 'my', 'broken', 'not working', 'won\'t', 'doesn\'t', 'issue', 'problem', 'what should', 'what do', 'can i', 'how to', 'need', 'want'];
  const hasRepairRequest = repairRequestIndicators.some((r) => q.includes(r));
  const symptomWords = ['makes noise', 'making noise', 'smells', 'smelling', 'sound', 'noise', 'leaking', 'dripping', 'buzzing', 'flickering', 'hot', 'warm', 'cold', 'wet'];
  if (!hasRepairRequest && symptomWords.some((s) => q.includes(s))) {
    return { intent: 'symptom_describe' };
  }

  const diagnosisWords = ['what is causing', 'why is this', 'what caused', 'diagnosis', 'root cause', 'what\'s wrong', 'what happened'];
  if (diagnosisWords.some((d) => q.includes(d))) {
    return { intent: 'diagnosis' };
  }

  const stepWords = ['step by step', 'steps', 'how to fix', 'instructions', 'walk me through', 'guide me', 'detailed guide'];
  if (stepWords.some((s) => q.includes(s))) {
    return { intent: 'step_by_step' };
  }

  const quickFixWords = ['quick fix', 'temporary', 'for now', 'band aid', 'workaround', 'patch', 'quick'];
  if (quickFixWords.some((k) => q.includes(k))) {
    return { intent: 'quick_fix' };
  }

  const toolsWords = ['tools', 'what do i need', 'equipment', 'supplies', 'materials', 'wrench', 'screwdriver'];
  if (toolsWords.some((t) => q.includes(t))) {
    return { intent: 'tools_needed' };
  }

  const difficultyWords = ['hard', 'difficult', 'easy', 'simple', 'complicated', 'beginner', 'can i do this', 'diy', 'myself'];
  if (difficultyWords.some((d) => q.includes(d))) {
    return { intent: 'difficulty' };
  }

  const timeWords = ['how long', 'time', 'minutes', 'hours', 'quick', 'slow'];
  if (timeWords.some((t) => q.includes(t))) {
    return { intent: 'time_estimate' };
  }

  const costWords = ['cost', 'price', 'expensive', 'cheap', 'money', 'how much', 'budget'];
  if (costWords.some((c) => q.includes(c))) {
    return { intent: 'cost_estimate' };
  }

  const safetyWords = ['dangerous', 'safe', 'safety', 'hurt', 'shock', 'risk', 'should i call'];
  if (safetyWords.some((s) => q.includes(s))) {
    return { intent: 'safety_check' };
  }

  const replaceWords = ['replace', 'repair', 'buy new', 'fix or', 'worth fixing'];
  if (replaceWords.some((r) => q.includes(r))) {
    return { intent: 'replace_vs_fix' };
  }

  const compareWords = ['which is better', 'compare', 'difference between', 'vs', 'versus', 'best option'];
  if (compareWords.some((c) => q.includes(c))) {
    return { intent: 'compare_solutions' };
  }

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

  const multiIssueMarkers = ['and', 'also', 'plus', 'as well', 'both', 'another'];
  const issueCount = multiIssueMarkers.filter((m) => q.includes(m)).length;
  if (issueCount >= 1 && (q.includes('leak') || q.includes('not working') || q.includes('broken') || q.includes('problem'))) {
    return { intent: 'multi_issue' };
  }

  const offtopicWords = ['weather', 'news', 'politics', 'sports', 'movie', 'music', 'game', 'food recipe', 'cook', 'math', 'calculate', 'translate', 'stock', 'crypto', 'bitcoin'];
  const repairDomainWords = ['fix', 'repair', 'broken', 'leak', 'problem', 'issue', 'not working', 'won\'t', 'doesn\'t', 'help', 'how to', 'troubleshoot', 'faucet', 'pipe', 'toilet', 'car', 'phone', 'laptop', 'washer', 'fridge', 'battery', 'tire', 'oil', 'charger', 'router', 'wifi', 'internet', 'screen', 'door', 'window', 'wall', 'paint', 'light', 'outlet', 'breaker'];
  const hasOfftopic = offtopicWords.some((o) => q.includes(o));
  const hasRepair = repairDomainWords.some((r) => q.includes(r));
  if (hasOfftopic && !hasRepair) {
    return { intent: 'offtopic' };
  }

  return { intent: 'expert' };
}
