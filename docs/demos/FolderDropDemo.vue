<template>
  <DemoFrame
    title="Reorder files or drop them into folders"
    description="Use a folder’s narrow edge strips to reorder, or its inset centre to move a file into that folder."
    docs-link="/components/droplist.html#drop-onto-list-items"
    docs-label="View nested item-target docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <DropList
      :items="entries"
      accepts-type="file-entry"
      class="dnd-demo__list folder-demo__list"
      column
      mode="cut"
      no-animations
      @insert="insertAtRoot"
      @reorder="reorder"
    >
      <template #item="{ item }">
        <Drag
          v-if="isFile(item)"
          :key="item.id"
          :data="filePayload(item, null)"
          class="folder-demo__file"
          type="file-entry"
          @cut="removeFile(null, item.id)"
        >
          <span aria-hidden="true">📄</span>
          <span>{{ item.name }}</span>
        </Drag>

        <Drag
          v-else
          :key="item.id"
          :data="item"
          class="folder-demo__folder"
          handle=".folder-demo__folder-handle"
          type="folder-entry"
        >
          <small class="folder-demo__edge">Reorder above</small>
          <Drop
            accepts-type="file-entry"
            :accepts-data="canDropInto(item)"
            class="folder-demo__folder-target"
            mode="cut"
            @drop="moveIntoFolder(item, $event)"
          >
            <div class="folder-demo__folder-handle">
              <span aria-hidden="true">📁</span>
              <strong>{{ item.name }}</strong>
              <small>Drop files in this centre area</small>
            </div>

            <div v-if="item.files.length" class="folder-demo__contents">
              <Drag
                v-for="file in item.files"
                :key="file.id"
                :data="filePayload(file, item.id)"
                class="folder-demo__nested-file"
                type="file-entry"
                @cut="removeFile(item.id, file.id)"
              >
                <span aria-hidden="true">📄</span>
                {{ file.name }}
              </Drag>
            </div>
            <small v-else class="folder-demo__empty">Empty folder</small>
          </Drop>
          <small class="folder-demo__edge">Reorder below</small>
        </Drag>
      </template>

      <template #feedback>
        <div key="folder-insert-feedback" class="folder-demo__feedback">
          Insert at root
        </div>
      </template>

      <template #reordering-feedback>
        <div key="folder-reorder-feedback" class="folder-demo__feedback">
          Reorder here
        </div>
      </template>
    </DropList>
    <!-- #endregion demo-template -->

    <template #footer>
      {{ status }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, Drop, DropList } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';
import type { DemoInsertEvent, DemoReorderEvent } from './types';

interface DemoFile {
  id: number;
  kind: 'file';
  name: string;
}

interface DemoFolder {
  id: number;
  kind: 'folder';
  name: string;
  files: DemoFile[];
}

interface FilePayload {
  file: DemoFile;
  sourceFolderId: number | null;
}

type DemoEntry = DemoFile | DemoFolder;

const makeEntries = (): DemoEntry[] => [
  { id: 1, kind: 'file', name: 'README.md' },
  {
    id: 2,
    kind: 'folder',
    name: 'Design assets',
    files: [{ id: 3, kind: 'file', name: 'logo.svg' }]
  },
  { id: 4, kind: 'file', name: 'roadmap.md' },
  { id: 5, kind: 'folder', name: 'Archive', files: [] }
];

const entries = ref<DemoEntry[]>(makeEntries());
const status = ref('Try the top and bottom edges of a folder, then its centre.');
const isFile = (entry: DemoEntry): entry is DemoFile => entry.kind === 'file';
const isFilePayload = (data: unknown): data is FilePayload => {
  if (!data || typeof data !== 'object' || !('file' in data) || !('sourceFolderId' in data)) return false;
  const payload = data as Partial<FilePayload>;
  return !!payload.file && isFile(payload.file) &&
    (payload.sourceFolderId === null || typeof payload.sourceFolderId === 'number');
};
const filePayload = (file: DemoFile, sourceFolderId: number | null): FilePayload => ({
  file,
  sourceFolderId
});
const canDropInto = (folder: DemoFolder) => (data: unknown) =>
  isFilePayload(data) && data.sourceFolderId !== folder.id;

const removeFile = (sourceFolderId: number | null, fileId: number) => {
  if (sourceFolderId === null) {
    const index = entries.value.findIndex(entry => entry.id === fileId);
    if (index >= 0) entries.value.splice(index, 1);
    return;
  }

  const folder = entries.value.find(entry => entry.id === sourceFolderId);
  if (!folder || isFile(folder)) return;
  const index = folder.files.findIndex(file => file.id === fileId);
  if (index >= 0) folder.files.splice(index, 1);
};
const moveIntoFolder = (folder: DemoFolder, event: DnDEventPayload) => {
  if (!isFilePayload(event.data)) return;
  folder.files.push(event.data.file);
  status.value = `Moved ${event.data.file.name} into ${folder.name}.`;
};
const insertAtRoot = (event: DemoInsertEvent<FilePayload>) => {
  entries.value.splice(event.index, 0, event.data.file);
  status.value = `Moved ${event.data.file.name} back to the root list.`;
};
const reorder = (event: DemoReorderEvent) => {
  event.apply(entries.value);
  status.value = `Reordered root position ${event.from + 1} to ${event.to + 1}.`;
};
const reset = () => {
  entries.value = makeEntries();
  status.value = 'Try the top and bottom edges of a folder, then its centre.';
};
// #endregion demo-script
</script>

<style scoped>
.folder-demo__list {
  max-width: 34rem;
  margin: 0 auto;
}

.folder-demo__file,
.folder-demo__folder {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-1);
}

.folder-demo__file {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem;
  cursor: grab;
}

.folder-demo__folder {
  padding: 0.35rem 0.55rem;
}

.folder-demo__edge {
  display: block;
  padding: 0.2rem;
  color: var(--vp-c-text-3);
  font-size: 0.68rem;
  text-align: center;
  text-transform: uppercase;
}

.folder-demo__folder-target {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.15s, background 0.15s;
}

.folder-demo__folder-target.drop-in.drop-allowed {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.folder-demo__folder-handle {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.1rem 0.55rem;
  padding: 0.7rem;
  cursor: grab;
}

.folder-demo__folder-handle small {
  grid-column: 2;
  color: var(--vp-c-text-2);
}

.folder-demo__contents {
  display: grid;
  gap: 0.35rem;
  padding: 0 0.7rem 0.7rem 2rem;
}

.folder-demo__nested-file {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: grab;
}

.folder-demo__empty {
  display: block;
  padding: 0 0.7rem 0.7rem 2rem;
  color: var(--vp-c-text-3);
}

.folder-demo__feedback {
  min-height: 2.3rem;
  display: grid;
  place-content: center;
  border: 2px dashed var(--vp-c-brand-1);
  border-radius: 7px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}
</style>
