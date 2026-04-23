import { Zap, Wrench, Home, Cpu, Car } from 'lucide-react-native';

export const CHIPS = [
  'My faucet is leaking',
  'AC not cooling',
  'Car won\'t start',
  'Phone not charging',
];

export const CATEGORY_ICONS: Record<string, typeof Zap> = {
  home: Home,
  appliances: Wrench,
  car: Car,
  electronics: Cpu,
};

export const CATEGORY_LABELS: Record<string, string> = {
  home: 'Home',
  appliances: 'Appliances',
  car: 'Car',
  electronics: 'Electronics',
};

export const CATEGORY_COLORS: Record<string, string> = {
  home: '#3B82F6',
  appliances: '#F59E0B',
  car: '#EF4444',
  electronics: '#8B5CF6',
};

export const PROFANITY_LIST = [
  'damn',
  'hell',
  'crap',
  'stupid',
  'idiot',
  'dumb',
  'shut up',
  'hate you',
  'useless',
  'worst',
  'trash',
  'garbage',
  'suck',
  'sucks',
];

export const SYNONYM_MAP: Record<string, string[]> = {
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
