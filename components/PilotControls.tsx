
import React from 'react';
import { PilotState, PlanetState, ViewMode } from '../types';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  RotateCw, Play, Pause, Flame, Snowflake, 
  Moon, Sun, Box, Trash2, Camera
} from 'lucide-react';

interface PilotControlsProps {
  pilot: PilotState;
  setPilot: React.Dispatch<React.SetStateAction<PilotState>>;
  planetState: PlanetState;
  setPlanetState: (s: PlanetState) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}

export const PilotControls: React.FC<PilotControlsProps> = ({
  pilot, setPilot, planetState, setPlanetState, viewMode, setViewMode
}) => {
  const updatePilot = (updates: Partial<PilotState>) => setPilot(p => ({ ...p, ...updates }));

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 pointer-events-none w-full max-w-4xl px-4">
      {/* Pilot Dashboard */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl w-full flex items-center justify-between pointer-events-auto shadow-2xl overflow-x-auto">
        
        {/* Navigation Dial */}
        <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Navigation</span>
            <div className="grid grid-cols-3 gap-2">
                <div />
                <button onClick={() => updatePilot({ rotationX: pilot.rotationX - 0.1 })} className="p-2 hover:bg-white/20 rounded-lg transition-colors bg-white/5"><ArrowUp size={18} className="text-white" /></button>
                <div />
                <button onClick={() => updatePilot({ rotationY: pilot.rotationY - 0.1 })} className="p-2 hover:bg-white/20 rounded-lg transition-colors bg-white/5"><ArrowLeft size={18} className="text-white" /></button>
                <button onClick={() => updatePilot({ isSpinning: !pilot.isSpinning })} className={`p-2 rounded-lg transition-colors ${pilot.isSpinning ? 'bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 hover:bg-white/20'}`}>
                    <RotateCw size={18} className="text-white" />
                </button>
                <button onClick={() => updatePilot({ rotationY: pilot.rotationY + 0.1 })} className="p-2 hover:bg-white/20 rounded-lg transition-colors bg-white/5"><ArrowRight size={18} className="text-white" /></button>
                <div />
                <button onClick={() => updatePilot({ rotationX: pilot.rotationX + 0.1 })} className="p-2 hover:bg-white/20 rounded-lg transition-colors bg-white/5"><ArrowDown size={18} className="text-white" /></button>
                <div />
            </div>
        </div>

        {/* Altitude Slider */}
        <div className="flex flex-col gap-2 px-8 flex-1 min-w-[150px]">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Altitude (Elevate/Dive)</span>
            <input 
                type="range" 
                min="2.5" 
                max="8" 
                step="0.1" 
                value={pilot.elevation} 
                onChange={(e) => updatePilot({ elevation: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-white/40 font-mono">
                <span>2,500m</span>
                <span>8,000m</span>
            </div>
        </div>

        {/* Planet FX */}
        <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Elemental Controls</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setPlanetState(PlanetState.FIRE)} 
                    className={`p-3 rounded-2xl transition-all ${planetState === PlanetState.FIRE ? 'bg-orange-600 scale-110' : 'bg-white/5 hover:bg-white/20'}`}
                >
                    <Flame size={20} className="text-white" />
                </button>
                <button 
                    onClick={() => setPlanetState(PlanetState.FREEZE)} 
                    className={`p-3 rounded-2xl transition-all ${planetState === PlanetState.FREEZE ? 'bg-cyan-500 scale-110' : 'bg-white/5 hover:bg-white/20'}`}
                >
                    <Snowflake size={20} className="text-white" />
                </button>
                <button 
                    onClick={() => setPlanetState(planetState === PlanetState.NIGHT ? PlanetState.NORMAL : PlanetState.NIGHT)} 
                    className={`p-3 rounded-2xl transition-all ${planetState === PlanetState.NIGHT ? 'bg-indigo-600 scale-110' : 'bg-white/5 hover:bg-white/20'}`}
                >
                    <Moon size={20} className="text-white" />
                </button>
                <button 
                    onClick={() => setPlanetState(PlanetState.NORMAL)} 
                    className={`p-3 rounded-2xl transition-all ${planetState === PlanetState.NORMAL ? 'bg-blue-600 scale-110' : 'bg-white/5 hover:bg-white/20'}`}
                >
                    <Sun size={20} className="text-white" />
                </button>
            </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col gap-2 pl-8">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">View Engine</span>
            <div className="flex bg-white/5 p-1 rounded-xl">
                <button 
                    onClick={() => setViewMode(ViewMode.TOUR)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === ViewMode.TOUR ? 'bg-white text-black' : 'text-white/60'}`}
                >
                    Tour
                </button>
                <button 
                    onClick={() => setViewMode(ViewMode.PILOT)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === ViewMode.PILOT ? 'bg-white text-black' : 'text-white/60'}`}
                >
                    Pilot
                </button>
            </div>
        </div>
      </div>

      <div className="flex gap-4 pointer-events-auto">
        <button 
            onClick={() => updatePilot({ isBouncing: !pilot.isBouncing })}
            className={`px-6 py-2 rounded-full border border-white/20 backdrop-blur-md text-white font-orbitron text-sm transition-all ${pilot.isBouncing ? 'bg-purple-500/40 border-purple-400' : 'hover:bg-white/10'}`}
        >
            Planet Dance
        </button>
        <button className="px-6 py-2 rounded-full border border-white/20 backdrop-blur-md text-white font-orbitron text-sm hover:bg-white/10 transition-all flex items-center gap-2">
            <Camera size={14} /> Capture
        </button>
      </div>
    </div>
  );
};
