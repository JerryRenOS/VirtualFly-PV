
import React, { useState, useEffect } from 'react';
import { Globe } from './components/Globe';
import { PilotControls } from './components/PilotControls';
import { TourPanel } from './components/TourPanel';
import { PilotState, PlanetState, ViewMode, TourLocation } from './types';
import { Shield, Radio, Wind, Plane, Speaker, Info } from 'lucide-react';

const App: React.FC = () => {
  const [pilot, setPilot] = useState<PilotState>({
    elevation: 4.0,
    rotationX: 0,
    rotationY: 0,
    speed: 1,
    isSpinning: true,
    isBouncing: false
  });

  const [planetState, setPlanetState] = useState<PlanetState>(PlanetState.NORMAL);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PILOT);
  const [selectedLocation, setSelectedLocation] = useState<TourLocation | null>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    // Initial cinematic boot
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
        <div className="relative">
          <div className="w-24 h-24 border-t-2 border-blue-500 rounded-full animate-spin" />
          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
        </div>
        <div className="mt-12 text-center">
          <h1 className="text-white font-orbitron text-2xl tracking-[0.4em] mb-2">PURAVIDA</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest animate-pulse">Initializing Virtual Fly System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* 3D Content Background */}
      <Globe pilot={pilot} planetState={planetState} selectedLocation={selectedLocation} />

      {/* HUD Header */}
      <header className="fixed top-0 left-0 w-full p-8 z-50 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-black rounded-2xl shadow-xl">
              <Plane size={24} />
            </div>
            <div>
              <h1 className="text-white font-orbitron text-xl tracking-tighter">VIRTUAL FLY <span className="text-blue-500">ONE</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                <Radio size={10} className="text-green-400" />
                Signal: Optimal
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4 text-white/60 text-[10px] font-mono pointer-events-auto">
            <div className="flex items-center gap-2"><Wind size={12} /> AIRSPEED: {(100 + Math.random() * 5).toFixed(1)} KN</div>
            <div className="flex items-center gap-2"><Shield size={12} /> HULL: 100%</div>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white">
                <Speaker size={20} />
            </button>
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white">
                <Info size={20} />
            </button>
        </div>
      </header>

      {/* Tour Panel (Sidebar) */}
      {viewMode === ViewMode.TOUR && (
        <TourPanel 
            onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setPilot(p => ({ ...p, isSpinning: false, elevation: 3.0 }));
            }} 
            selectedLocation={selectedLocation} 
        />
      )}

      {/* Pilot Controls (HUD Bottom) */}
      <PilotControls 
        pilot={pilot} 
        setPilot={setPilot} 
        planetState={planetState} 
        setPlanetState={setPlanetState}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      
      {/* Grid Overlay for Cockpit feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
    </div>
  );
};

export default App;
