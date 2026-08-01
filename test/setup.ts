import { afterEach, beforeEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';
import { dnd } from '../lib/src/js/DnD';

enableAutoUnmount(afterEach);

beforeEach(() => {
  dnd.resetVariables();
  document.body.innerHTML = '';
  document.documentElement.classList.remove('drag-in-progress');
});

afterEach(() => {
  dnd.resetVariables();
  document.body.innerHTML = '';
  document.documentElement.classList.remove('drag-in-progress');
});
