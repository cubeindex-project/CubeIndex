import { writable } from 'svelte/store';

function createDeveloperMode() {
  let initial = false;
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('developerMode');
    initial = saved === 'true';
  }
  const store = writable<boolean>(initial);
  store.subscribe((value) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('developerMode', value ? 'true' : 'false');
    }
  });
  return store;
}

export const developerMode = createDeveloperMode();
