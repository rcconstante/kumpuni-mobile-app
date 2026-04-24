// Renders a collection's chosen icon (asset image / emoji char / lucide icon / uploaded photo).
import React from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Collection, IconKind } from '../db/types';
import { getAssetIcon, getLucideIcon } from './iconCatalog';

interface Props {
  iconKind: IconKind;
  iconValue: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function CollectionIcon({ iconKind, iconValue, color = '#F3F4F6', size = 48, style }: Props) {
  const dim = { width: size, height: size, borderRadius: Math.round(size * 0.22) };
  if (iconKind === 'asset') {
    const opt = getAssetIcon(iconValue);
    return (
      <View style={[{ backgroundColor: opt.color, alignItems: 'center', justifyContent: 'center' }, dim, style]}>
        <Image source={opt.image} style={{ width: size * 0.7, height: size * 0.7 }} resizeMode="contain" />
      </View>
    );
  }
  if (iconKind === 'emoji') {
    return (
      <View style={[{ backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, dim, style]}>
        <Text style={{ fontSize: size * 0.55 }}>{iconValue}</Text>
      </View>
    );
  }
  if (iconKind === 'lucide') {
    const Icon = getLucideIcon(iconValue);
    return (
      <View style={[{ backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, dim, style]}>
        <Icon size={size * 0.5} color="#0D9488" />
      </View>
    );
  }
  // photo
  return (
    <View style={[{ backgroundColor: color, overflow: 'hidden' }, dim, style]}>
      <Image source={{ uri: iconValue }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
  );
}

export function CollectionIconForCollection({ collection, size, style }: { collection: Pick<Collection, 'iconKind' | 'iconValue' | 'color'>; size?: number; style?: StyleProp<ViewStyle> }) {
  return <CollectionIcon iconKind={collection.iconKind} iconValue={collection.iconValue} color={collection.color} size={size} style={style} />;
}
