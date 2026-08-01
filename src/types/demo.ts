import type { DnDEventPayload } from '../../lib/src/types';

export interface InsertPayload<T = unknown> {
  data: T;
  index: number;
}

export interface ReorderPayload {
  apply<T>(items: T[]): void;
}

export interface CardItem {
  avatar: string;
  title: string;
  subtitle: string;
}

export interface DessertItem {
  name: string;
  calories: number;
  fat: number;
}

export interface NestedItemGroup {
  key: number;
  type: 'row' | 'col';
  items: NestedItem[];
}

export type NestedItem = number | NestedItemGroup;
export type DemoDnDEvent = DnDEventPayload;
