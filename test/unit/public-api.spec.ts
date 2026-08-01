import { describe, expect, it } from 'vitest';
import * as api from '../../lib/src';

describe('package public API', () => {
  it('exports every supported component, composable, helper, and event class', () => {
    expect(Object.keys(api)).toEqual(expect.arrayContaining([
      'Drag',
      'Drop',
      'DropList',
      'DropMask',
      'DragFeedback',
      'useDragAware',
      'useDrag',
      'useDrop',
      'DragImagesManager',
      'refreshDragImage',
      'dnd',
      'DnDEvent',
      'InsertEvent',
      'ReorderEvent',
      'createDragImage'
    ]));
  });
});
