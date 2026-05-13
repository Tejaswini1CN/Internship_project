import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, Utensils, HeartPulse, Music, Users, 
  Car, ShoppingBag, Landmark, Activity, Bath, Shield, Search, MapPin
} from 'lucide-react';
import { CustomButton } from '../components/ui/CustomButton';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { APIProvider, Map, AdvancedMarker, useMap, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useAppContext } from '../store/AppContext';

// Fair walking path coordinates
const JATRE_PATH = [
  { lat: 12.956500, lng: 77.585000 }, // North Parking
  { lat: 12.955500, lng: 77.584000 }, // Annadasoha Hall
  { lat: 12.954294, lng: 77.585500 }, // Main Temple
  { lat: 12.952500, lng: 77.586500 }, // Kusti Arena
];

function PolylineOverlay({ path }: { path: typeof JATRE_PATH }) {
  const map = useMap();
  const polylineRef = React.useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        strokeColor: '#3b82f6', // blue-500
        strokeOpacity: 0.5,
        strokeWeight: 6,
        geodesic: true,
        clickable: false
      });
      polylineRef.current.setMap(map);
    }
    return () => {
      polylineRef.current?.setMap(null);
    };
  }, [map, path]);

  return null;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || (process as any).env?.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

type MarkerCategory = 'All' | 'Food' | 'Parking' | 'Safety' | 'Events' | 'Shops' | 'Emergency' | 'Temple' | 'Facilities';

const MARKERS = [
  { id: 1, title: 'Main Temple', locationName: 'Main Temple', category: 'Temple', lat: 12.954294, lng: 77.585500, icon: Landmark, color: 'text-emerald-500 bg-emerald-500', desc: 'The heart of the Jatre where all major poojas happen.' },
  { id: 2, title: 'Annadasoha Hall', locationName: 'Annadasoha Hall', category: 'Food', lat: 12.955500, lng: 77.584000, icon: Utensils, color: 'text-orange-500 bg-orange-500', desc: 'Delicious local delicacies and free prasada meals.' },
  { id: 3, title: 'First Aid Booth', locationName: 'First Aid', category: 'Emergency', lat: 12.953500, lng: 77.586000, icon: HeartPulse, color: 'text-red-500 bg-red-500', desc: 'Emergency medical services and first aid teams.' },
  { id: 4, title: 'Cultural Stage', locationName: 'Cultural Stage', category: 'Events', lat: 12.953000, lng: 77.584500, icon: Music, color: 'text-purple-500 bg-purple-500', desc: 'Yakshagana and folk dance performances happen here.' },
  { id: 5, title: 'Help Desk Center', locationName: 'Help Desk', category: 'Safety', lat: 12.955000, lng: 77.586500, icon: Users, color: 'text-cyan-500 bg-cyan-500', desc: 'Lost items and missing person reporting center.' },
  { id: 6, title: 'North Parking', locationName: 'Parking', category: 'Parking', lat: 12.956500, lng: 77.585000, icon: Car, color: 'text-blue-500 bg-blue-500', desc: 'Main two-wheeler and four-wheeler parking.' },
  { id: 7, title: 'Jatre Toy Shops', locationName: 'Toy Shops', category: 'Shops', lat: 12.954500, lng: 77.583500, icon: ShoppingBag, color: 'text-pink-500 bg-pink-500', desc: 'Local toys, bangles, and fair merchandise stalls.' },
  { id: 8, title: 'Kusti Arena', locationName: 'Wrestling Arena', category: 'Events', lat: 12.952500, lng: 77.586500, icon: Activity, color: 'text-amber-500 bg-amber-500', desc: 'Traditional wrestling matches during the afternoon.' },
  { id: 9, title: 'Public Toilets', locationName: 'Toilets', category: 'Facilities', lat: 12.953800, lng: 77.583000, icon: Bath, color: 'text-slate-500 bg-slate-500', desc: 'Clean washroom facilities for men and women.' },
  { id: 10, title: 'Police Outpost', locationName: 'Police', category: 'Emergency', lat: 12.956000, lng: 77.586000, icon: Shield, color: 'text-indigo-500 bg-indigo-500', desc: 'Local security and police assistance point.' },
];

const FILTER_TAGS: MarkerCategory[] = ['All', 'Events', 'Food', 'Emergency', 'Parking', 'Safety', 'Shops', 'Temple'];

function CustomMapContent() {
  const [selectedCategory, setSelectedCategory] = useState<MarkerCategory>('All');
  const [selectedMarker, setSelectedMarker] = useState<typeof MARKERS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const navigate = useNavigate();
  const map = useMap();
  const { events } = useAppContext();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location not allowed', err) // Silently fail, typical for maps without explicit user action
      );
    }
  }, []);

  const liveLocations = useMemo(() => {
    return events.filter(e => e.isLive).map(e => e.location);
  }, [events]);

  const filteredMarkers = useMemo(() => {
    let result = MARKERS;
    if (selectedCategory !== 'All') {
      result = result.filter(m => m.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const handleMarkerClick = (marker: typeof MARKERS[0]) => {
    setSelectedMarker(marker);
    if (map) {
      map.panTo({ lat: marker.lat, lng: marker.lng });
      map.setZoom(18);
    }
  };

  const handleGetDirections = () => {
    if (!selectedMarker) return;
    const destination = `${selectedMarker.lat},${selectedMarker.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="absolute top-0 inset-x-0 bg-surface/90 backdrop-blur-xl px-4 py-4 pt-safe border-b border-border flex flex-col z-20 shadow-sm transition-all">
         <div className="flex items-center gap-3 mb-4">
             <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-border transition-colors -ml-2 text-text-primary">
                <ChevronLeft size={28} />
             </button>
             <div className="relative flex-1">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-secondary">
                 <Search size={18} />
               </div>
               <input 
                 type="text"
                 placeholder="Search places, food, emergency..."
                 className="w-full bg-background border border-border rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setSelectedMarker(null)}
               />
             </div>
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 snap-x">
             {FILTER_TAGS.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={cn(
                       "snap-start shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors",
                       selectedCategory === cat 
                         ? "bg-text-primary text-surface border-text-primary" 
                         : "bg-background text-text-secondary border-border hover:border-primary/50"
                   )}
                 >
                     {cat}
                 </button>
             ))}
         </div>
      </div>

      <Map
        defaultCenter={{ lat: 12.954294, lng: 77.585500 }}
        defaultZoom={17}
        mapId="JATRE_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        disableDefaultUI={true}
        gestureHandling="greedy"
        className="w-full h-full"
      >
        {filteredMarkers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          const isLive = liveLocations.includes(marker.locationName);
          
          return (
            <AdvancedMarker 
              key={marker.id} 
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker)}
              zIndex={isSelected ? 100 : isLive ? 50 : 10}
            >
              <div className="relative flex flex-col items-center group">
                 {isLive && (
                   <div className="absolute -top-6 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-sm animate-pulse shadow-md whitespace-nowrap">
                     LIVE NOW
                   </div>
                 )}
                 {isLive && (
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40 scale-150 pointer-events-none" />
                 )}
                 <div className={cn(
                    "p-2 rounded-full border border-surface/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 relative", 
                    marker.color,
                    isSelected ? "ring-4 ring-text-primary/30 scale-125 shadow-xl" : "group-hover:scale-110",
                    isLive ? "bg-red-500 text-white" : "text-white"
                 )}>
                   <marker.icon size={isSelected ? 20 : 16} strokeWidth={2.5} />
                 </div>
                 
                 {/* Only show title on selected or when live, or slightly big to avoid extreme clutter */}
                 {isSelected && (
                    <div className="absolute top-full mt-2 bg-text-primary text-surface px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md pointer-events-none z-10">
                      {marker.title}
                    </div>
                 )}
              </div>
            </AdvancedMarker>
          );
        })}

        {userLocation && (
           <AdvancedMarker position={userLocation} zIndex={1000}>
              <div className="relative flex items-center justify-center">
                 <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping pointer-events-none" />
                 <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                 </div>
              </div>
           </AdvancedMarker>
        )}

        <PolylineOverlay path={JATRE_PATH} />
      </Map>

      {/* Bottom Sheet Details */}
      <AnimatePresence>
        {selectedMarker && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/10 z-30 pointer-events-none"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 bg-surface rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-40 p-6 pt-4 border-t border-border pb-safe"
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" 
                   onClick={() => setSelectedMarker(null)} />
              
              <div className="flex items-start justify-between mb-4 gap-4">
                 <div className="flex items-start gap-4">
                    <div className={cn("p-4 rounded-2xl shrink-0 shadow-sm", selectedMarker.color)}>
                       <selectedMarker.icon size={28} className="text-white" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary bg-background px-2 py-0.5 rounded-sm">
                             {selectedMarker.category}
                          </span>
                          {liveLocations.includes(selectedMarker.locationName) && (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-sm animate-pulse">
                              Active Event
                            </span>
                          )}
                       </div>
                       <h2 className="text-2xl font-black text-text-primary leading-tight">{selectedMarker.title}</h2>
                    </div>
                 </div>
                 <button onClick={() => setSelectedMarker(null)} className="p-2 bg-background rounded-full text-text-secondary hover:bg-border/80 transition-colors shrink-0">
                    <X size={20} />
                 </button>
              </div>
              
              <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
                 {selectedMarker.desc}
              </p>
              
              <div className="flex gap-3">
                 <CustomButton className="flex-1" onClick={handleGetDirections}>
                   <MapPin size={18} className="mr-2" />
                   Get Directions
                 </CustomButton>
                 {['Emergency', 'Safety'].includes(selectedMarker.category) && (
                    <CustomButton variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10">
                       Contact Desk
                    </CustomButton>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Wrapping the main component to handle the "Key Missing" UI
export function MapScreen() {
  if (!hasValidKey) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-background justify-center items-center p-6 text-center pt-safe pb-32">
        <div className="p-6 bg-surface border border-border shadow-md rounded-3xl w-full max-w-sm">
           <MapPin size={48} className="text-primary mx-auto mb-4 opacity-50" />
           <h2 className="text-xl font-black text-text-primary mb-2">Map Under Construction</h2>
           <p className="text-sm text-text-secondary font-medium mb-6">
             Please add your Google Maps API Key to the environment variables to activate the smart navigation system.
           </p>
           <ul className="text-left text-xs text-text-secondary/80 font-medium space-y-2 bg-background p-4 rounded-xl border border-border mb-6">
              <li>1. Open <strong>Settings</strong> (⚙️ top-right)</li>
              <li>2. Go to <strong>Secrets</strong></li>
              <li>3. Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
           </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden">
      <APIProvider apiKey={API_KEY} version="weekly">
         <CustomMapContent />
      </APIProvider>
    </div>
  );
}
