// Shared icon catalog used by AddModal, CollectionCard, etc.
import {
  Bookmark,
  Star,
  Heart,
  Folder,
  Zap,
  Globe,
  Music,
  Coffee,
  Code,
  Book,
  Briefcase,
  ShoppingBag,
  Gamepad2,
  Plane,
  Utensils,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react-native';

export interface AssetIconOption {
  id: string;
  image: any;
  color: string;
}

export const ASSET_ICONS: AssetIconOption[] = [
  { id: 'green',  image: require('../assets/images/green.png'),  color: '#C8F6E8' },
  { id: 'purple', image: require('../assets/images/purple.png'), color: '#EDE9FE' },
  { id: 'yellow', image: require('../assets/images/yellow.png'), color: '#FEF3C7' },
  { id: 'blue',   image: require('../assets/images/blue.png'),   color: '#DBEAFE' },
];

export function getAssetIcon(id: string): AssetIconOption {
  return ASSET_ICONS.find((a) => a.id === id) ?? ASSET_ICONS[0];
}

export interface LucideIconOption {
  id: string;
  Icon: LucideIcon;
  label: string;
}

export const LUCIDE_ICONS: LucideIconOption[] = [
  { id: 'bookmark',  Icon: Bookmark,   label: 'Bookmark' },
  { id: 'star',      Icon: Star,       label: 'Star' },
  { id: 'heart',     Icon: Heart,      label: 'Heart' },
  { id: 'folder',    Icon: Folder,     label: 'Folder' },
  { id: 'zap',       Icon: Zap,        label: 'Zap' },
  { id: 'globe',     Icon: Globe,      label: 'Globe' },
  { id: 'music',     Icon: Music,      label: 'Music' },
  { id: 'coffee',    Icon: Coffee,     label: 'Coffee' },
  { id: 'code',      Icon: Code,       label: 'Code' },
  { id: 'book',      Icon: Book,       label: 'Book' },
  { id: 'briefcase', Icon: Briefcase,  label: 'Work' },
  { id: 'shopping',  Icon: ShoppingBag,label: 'Shop' },
  { id: 'game',      Icon: Gamepad2,   label: 'Game' },
  { id: 'plane',     Icon: Plane,      label: 'Travel' },
  { id: 'food',      Icon: Utensils,   label: 'Food' },
  { id: 'fitness',   Icon: Dumbbell,   label: 'Fitness' },
];

export function getLucideIcon(id: string): LucideIcon {
  return LUCIDE_ICONS.find((l) => l.id === id)?.Icon ?? Folder;
}

export const EMOJI_LIST: string[] = [
  '😀','😎','🤩','🥳','🎉','🔥','⭐','💡','📌','📎',
  '📂','📁','🗂️','📋','📊','📈','💼','🎯','🏆','🥇',
  '🎨','🎭','🎬','🎵','🎮','🕹️','📱','💻','🖥️','⌨️',
  '🔬','🔭','🧪','🧬','💊','🏥','🏫','🏢','🏠','🏡',
  '🚀','✈️','🚗','🚢','🌍','🌊','🏔️','🌿','🌸','🌺',
  '🍕','🍔','🍜','☕','🍵','🍦','🎂','🍩','🥗','🍎',
  '💰','💳','📉','🏦','💎','🛍️','🎁','🎀','🎊','🎈',
  '❤️','💛','💚','💙','💜','🖤','🤍','🧡','💗','💞',
];
