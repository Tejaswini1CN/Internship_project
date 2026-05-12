import { useState } from 'react';
import { useAppContext } from './AppContext';

export function useScheduleViewModel() {
  const { events } = useAppContext();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'Live' | 'Upcoming'>('All');

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredEvents = events.filter(event => {
    // 1. Filter by search query
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filter by Live/Upcoming mode (assuming!event.isLive is upcoming for simplicity)
    if (filterMode === 'Live' && !event.isLive) return false;
    if (filterMode === 'Upcoming' && event.isLive) return false;

    return true;
  });

  return {
    filteredEvents,
    expandedId,
    searchQuery,
    filterMode,
    toggleExpand,
    setSearchQuery,
    setFilterMode
  };
}
