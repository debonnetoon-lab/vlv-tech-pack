export { useUIStore } from './useUIStore';
export { useDataStore } from './useDataStore';
export { useCollaborationStore } from './useCollaborationStore';

import { useUIStore } from './useUIStore';
import { useDataStore } from './useDataStore';
import { useCollaborationStore } from './useCollaborationStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useTechPackStore = (selector?: (state: any) => any): any => {
  const ui = useUIStore();
  const data = useDataStore();
  const col = useCollaborationStore();
  const state = { ...ui, ...data, ...col };
  return selector ? selector(state) : state;
};
