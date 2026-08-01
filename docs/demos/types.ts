// #region demo-tree-types
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

export type DemoTreeOperation =
  | {
    kind: 'insert';
    groupId: number;
    index: number;
    item: DemoTreeItem;
  }
  | {
    kind: 'remove';
    groupId: number;
    itemId: number;
  }
  | {
    kind: 'reorder';
    groupId: number;
    event: DemoReorderEvent;
  };

export const isDemoGroup = (item: DemoTreeItem): item is DemoGroup =>
  'direction' in item;

export const applyDemoTreeOperation = (root: DemoGroup, operation: DemoTreeOperation): DemoGroup => {
  const update = (group: DemoGroup): DemoGroup => {
    if (group.id === operation.groupId) {
      const items = [...group.items];
      if (operation.kind === 'insert') {
        items.splice(operation.index, 0, operation.item);
      }
      else if (operation.kind === 'remove') {
        const index = items.findIndex(item => item.id === operation.itemId);
        if (index < 0) return group;
        items.splice(index, 1);
      }
      else {
        operation.event.apply(items);
      }
      return { ...group, items };
    }

    let changed = false;
    const items = group.items.map(item => {
      if (!isDemoGroup(item)) return item;
      const updated = update(item);
      if (updated !== item) changed = true;
      return updated;
    });
    return changed ? { ...group, items } : group;
  };

  return update(root);
};

let nextDemoId = 1000;
export const createDemoId = () => ++nextDemoId;
// #endregion demo-tree-types
