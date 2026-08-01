export interface DemoInsertEvent<T> {
  data: T;
  index: number;
}

export interface DemoReorderEvent {
  from: number;
  to: number;
  apply<T>(items: T[]): void;
}

export interface DemoCard {
  id: number;
  title: string;
  detail: string;
  author: string;
  avatar: string;
}

export interface DemoWidget {
  id: number;
  label: string;
  kind: 'text' | 'metric' | 'chart' | 'activity';
  value?: string;
  change?: string;
  body?: string;
}

export interface DemoGroup {
  id: number;
  direction: 'row' | 'column';
  items: DemoTreeItem[];
}

export type DemoTreeItem = DemoWidget | DemoGroup;

export const isDemoGroup = (item: DemoTreeItem): item is DemoGroup =>
  'direction' in item;

let nextDemoId = 1000;
export const createDemoId = () => ++nextDemoId;
