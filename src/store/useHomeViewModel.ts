import { useAppContext } from './AppContext';

export function useHomeViewModel() {
  const { events, lostItems, missingPersons, user, isGuest, syncState } = useAppContext();
  
  const liveEvent = events.find(e => e.isLive) || events[0];
  const activeMissingPersons = missingPersons.filter(p => p.status === 'Missing');
  const activeLostItems = lostItems.filter(i => i.status === 'Lost');
  const recentStories = activeMissingPersons; // Fix me later maybe not needed
  const isAlertsEmpty = activeMissingPersons.length === 0 && activeLostItems.length === 0;

  return {
    user,
    isGuest,
    liveEvent,
    activeMissingPersons,
    activeLostItems,
    isAlertsEmpty,
    syncState,
  };
}
