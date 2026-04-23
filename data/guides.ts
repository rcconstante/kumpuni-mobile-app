export interface GuideItem {
  id: string;
  title: string;
}

export interface SubCategory {
  id: string;
  title: string;
  icon?: string;
  items: GuideItem[];
}

export interface Category {
  id: string;
  title: string;
  icon?: string;
  color: string;
  subCategories: SubCategory[];
}

export const GUIDE_CATEGORIES: Category[] = [
  {
    id: 'home',
    title: 'Home',
    color: '#E3F2FD',
    subCategories: [
      {
        id: 'water-plumbing',
        title: 'Water & Plumbing',
        items: [
          { id: 'leaky-faucet', title: 'Leaky faucet' },
          { id: 'low-water-pressure', title: 'Low water pressure' },
          { id: 'clogged-sink', title: 'Clogged sink' },
          { id: 'slow-draining-shower', title: 'Slow draining shower' },
          { id: 'running-toilet', title: 'Running toilet' },
          { id: 'pipe-leak', title: 'Pipe leak (minor)' },
        ],
      },
      {
        id: 'doors-windows',
        title: 'Doors & Windows',
        items: [
          { id: 'squeaky-hinges', title: 'Squeaky hinges' },
          { id: 'door-wont-close', title: 'Door won\'t close' },
          { id: 'loose-doorknob', title: 'Loose doorknob' },
          { id: 'stuck-window', title: 'Stuck window' },
          { id: 'broken-lock', title: 'Broken lock (basic)' },
        ],
      },
      {
        id: 'walls-surfaces',
        title: 'Walls & Surfaces',
        items: [
          { id: 'small-wall-cracks', title: 'Small wall cracks' },
          { id: 'peeling-paint', title: 'Peeling paint' },
          { id: 'hole-drywall', title: 'Hole in drywall' },
          { id: 'mold-spots', title: 'Mold spots' },
        ],
      },
      {
        id: 'electrical',
        title: 'Electrical (basic)',
        items: [
          { id: 'light-not-working', title: 'Light not working' },
          { id: 'loose-outlet', title: 'Loose outlet' },
          { id: 'tripped-breaker', title: 'Tripped breaker' },
          { id: 'bulb-flickering', title: 'Bulb flickering' },
        ],
      },
    ],
  },
  {
    id: 'appliances',
    title: 'Appliances',
    color: '#F3E5F5',
    subCategories: [
      {
        id: 'washing-machine',
        title: 'Washing Machine',
        items: [
          { id: 'wm-not-draining', title: 'Not draining' },
          { id: 'wm-not-spinning', title: 'Not spinning' },
          { id: 'wm-leaking', title: 'Leaking water' },
          { id: 'wm-making-noise', title: 'Making noise' },
        ],
      },
      {
        id: 'refrigerator',
        title: 'Refrigerator',
        items: [
          { id: 'fridge-not-cooling', title: 'Not cooling' },
          { id: 'fridge-leaking', title: 'Water leaking' },
          { id: 'fridge-ice-buildup', title: 'Ice buildup' },
          { id: 'fridge-smell', title: 'Strange smell' },
        ],
      },
      {
        id: 'air-conditioner',
        title: 'Air Conditioner',
        items: [
          { id: 'ac-weak-airflow', title: 'Weak airflow' },
          { id: 'ac-not-cooling', title: 'Not cooling' },
          { id: 'ac-dirty-filter', title: 'Dirty filter' },
          { id: 'ac-water-dripping', title: 'Water dripping' },
        ],
      },
      {
        id: 'kitchen-appliances',
        title: 'Kitchen Appliances',
        items: [
          { id: 'microwave-not-heating', title: 'Microwave not heating' },
          { id: 'rice-cooker', title: 'Rice cooker not turning on' },
          { id: 'induction-pan', title: 'Induction not detecting pan' },
        ],
      },
    ],
  },
  {
    id: 'car',
    title: 'Car',
    color: '#FFF8E1',
    subCategories: [
      {
        id: 'battery',
        title: 'Battery',
        items: [
          { id: 'battery-corrosion', title: 'Corrosion cleaning' },
          { id: 'dead-battery', title: 'Dead battery' },
          { id: 'loose-terminals', title: 'Loose terminals' },
        ],
      },
      {
        id: 'tires',
        title: 'Tires',
        items: [
          { id: 'flat-tire', title: 'Flat tire' },
          { id: 'low-pressure', title: 'Low pressure' },
          { id: 'uneven-wear', title: 'Uneven wear' },
        ],
      },
      {
        id: 'fluids',
        title: 'Fluids',
        items: [
          { id: 'low-engine-oil', title: 'Low engine oil' },
          { id: 'coolant-check', title: 'Coolant check' },
          { id: 'brake-fluid', title: 'Brake fluid basics' },
        ],
      },
      {
        id: 'car-basics',
        title: 'Basics',
        items: [
          { id: 'car-wont-start', title: 'Car won\'t start' },
          { id: 'jumpstart', title: 'Jumpstart guide' },
          { id: 'warning-lights', title: 'Warning lights (basic meaning)' },
        ],
      },
    ],
  },
  {
    id: 'electronics',
    title: 'Electronics',
    color: '#E8F5E9',
    subCategories: [
      {
        id: 'phone',
        title: 'Phone',
        items: [
          { id: 'phone-not-charging', title: 'Not charging' },
          { id: 'phone-overheating', title: 'Overheating' },
          { id: 'slow-performance', title: 'Slow performance' },
        ],
      },
      {
        id: 'laptop',
        title: 'Laptop',
        items: [
          { id: 'laptop-overheating', title: 'Overheating' },
          { id: 'laptop-not-turning-on', title: 'Not turning on' },
          { id: 'battery-draining', title: 'Battery draining fast' },
        ],
      },
      {
        id: 'internet-router',
        title: 'Internet & Router',
        items: [
          { id: 'no-internet', title: 'No internet' },
          { id: 'slow-connection', title: 'Slow connection' },
          { id: 'router-reset', title: 'Router reset' },
        ],
      },
      {
        id: 'power-issues',
        title: 'Power Issues',
        items: [
          { id: 'broken-charger', title: 'Broken charger' },
          { id: 'extension-not-working', title: 'Extension not working' },
          { id: 'loose-plug', title: 'Loose plug' },
        ],
      },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return GUIDE_CATEGORIES.find((c) => c.id === id);
}

export function getAllGuideCount(): number {
  return GUIDE_CATEGORIES.reduce(
    (sum, cat) => sum + cat.subCategories.reduce((s, sub) => s + sub.items.length, 0),
    0
  );
}
