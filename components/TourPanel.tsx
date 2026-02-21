
import React, { useState, useEffect } from 'react';
import { LOCATIONS } from '../constants';
import { TourLocation } from '../types';
import { MapPin, Compass, Play, Sparkles } from 'lucide-react';
import { getTourNarration } from '../services/geminiService';

interface TourPanelProps {
  onSelectLocation: (loc: TourLocation) => void;
  selectedLocation: TourLocation | null;
}

export const TourPanel: React.FC<TourPanelProps> = ({ onSelectLocation, selectedLocation }) => {
  const [narration, setNarration] = useState<string>('');
  const [loadingNarration, setLoadingNarration] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      setLoadingNarration(true);
      getTourNarration(selectedLocation.name, selectedLocation.description).then(res => {
        setNarration(res);
        setLoadingNarration(false);
      });
    }
  }, [selectedLocation]);

  return (
    <div className="fixed top-24 right-8 z-40 w-80 flex flex-col gap-6 pointer-events-none">
      
      {/* Location Details */}
      {selectedLocation && (
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl pointer-events-auto shadow-2xl animate-in slide-in-from-right duration-500">
          <div className="relative h-40 w-full mb-4 rounded-2xl overflow-hidden group">
            <img src={selectedLocation.imageUrl} alt={selectedLocation.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-white p-1 rounded-full"><MapPin size={12} className="text-black" /></div>
                <span className="text-white text-xs font-bold tracking-tight">{selectedLocation.name}</span>
            </div>
          </div>
          
          <h2 className="text-white font-orbitron text-lg mb-2 flex items-center gap-2">
            <Compass size={18} className="text-blue-400" />
            In Sight
          </h2>
          
          <div className="space-y-4">
            <p className="text-white/60 text-xs leading-relaxed font-light">
              {selectedLocation.description}
            </p>
            
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
               <div className="flex items-center gap-2 mb-2 text-blue-400">
                 <Sparkles size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Guide Narration</span>
               </div>
               {loadingNarration ? (
                 <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-75" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-150" />
                 </div>
               ) : (
                 <p className="text-white text-[11px] italic font-light leading-snug">
                   "{narration}"
                 </p>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl pointer-events-auto shadow-2xl max-h-[400px] flex flex-col">
        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">Tour Destinations</h3>
        <div className="overflow-y-auto space-y-2 pr-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                selectedLocation?.id === loc.id 
                ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${selectedLocation?.id === loc.id ? 'border-white' : 'border-transparent opacity-60'}`}>
                    <img src={loc.imageUrl} className="w-full h-full object-cover" />
                 </div>
                 <span className="text-xs font-semibold">{loc.name}</span>
              </div>
              <Play size={12} className={`transition-all ${selectedLocation?.id === loc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
