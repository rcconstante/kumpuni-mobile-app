// Domain types mirroring the SQLite schema.

export type IconKind = 'asset' | 'emoji' | 'lucide' | 'photo';

export interface Collection {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  iconKind: IconKind;
  iconValue: string; // asset id ('green'|...), emoji, lucide id, or file uri
  color: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface CollectionWithCount extends Collection {
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface TagWithCount extends Tag {
  count: number;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  domain: string;
  notes: string;
  isBookmarked: boolean;
  isRead: boolean;
  collectionId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface LinkWithRelations extends Link {
  tags: Tag[];
  collection: Collection | null;
}

export interface ClipboardEntry {
  id: string;
  url: string;
  domain: string;
  saved: boolean;
  dismissed: boolean;
  createdAt: number;
}

export type LinkFilter = 'all' | 'recent' | 'favorites' | 'unread';

export interface CreateLinkInput {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  notes?: string;
  collectionId?: string | null;
  tagIds?: string[];
  isBookmarked?: boolean;
}

export interface UpdateLinkInput {
  title?: string;
  description?: string;
  image?: string;
  notes?: string;
  isBookmarked?: boolean;
  isRead?: boolean;
  collectionId?: string | null;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  parentId?: string | null;
  iconKind?: IconKind;
  iconValue?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  parentId?: string | null;
  iconKind?: IconKind;
  iconValue?: string;
  color?: string;
}
