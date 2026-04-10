import { useState, useRef } from 'react';
import { useThrottledRAF } from '../hooks/useThrottledRAF';

type Surface = 'Smooth Asphalt' | 'Wet Leaves' | 'Gravel' | 'Dirt Track';
type ContextState = 'Dry' | 'Raining';

const SURFACE_DATA: Record<Surface, { noise: number, baseLimit: number }> = {
  'Smooth Asphalt': { noise: 0.02, baseLimit: -0.8 },
  'Wet Leaves': { noise: 0.05, baseLimit: -0.3 },
  'Gravel': { noise: 0.2, baseLimit: -0.4 },
  'Dirt Track': { noise: 0.3, baseLimit: -0.5 },
};

const CHART_LENGTH = 150;

export default function AdaptiveTelemetry() {
  const [surface, setSurface] = useState<Surface>('Gravel');
  const [contextState, setContextState] = useState<ContextState>('Dry');
  const [brakingG, setBrakingG] = useState(0);
  const [zNoise, setZNoise] = useState(0);
  
  const [penaltyActive, setPenaltyActive] = useState(false);
  const [penaltyText, setPenaltyText] = useState("");
  
  // Charts State
  const [xHistory, setXHistory] = useState<number[]>(Array(CHART_LENGTH).fill(0));
  const [zHistory, setZHistory] = useState<number[]>(Array(CHART_LENGTH).fill(1));

  const brakingProgressRef = useRef(0);
  const brakingTargetRef = useRef(0);
  const penaltyTimerRef = useRef<number | null>(null);

  // Mutable refs for high-frequency data — flushed to state at ~15fps
  const xHistoryRef = useRef<number[]>(Array(CHART_LENGTH).fill(0));
  const zHistoryRef = useRef<number[]>(Array(CHART_LENGTH).fill(1));
  const brakeRef = useRef(0);
  const zNoiseRef = useRef(0);

  // Dynamic Limit Calculation
  const currentLimit = SURFACE_DATA[surface].baseLimit + (contextState === 'Raining' ? 0.3 : 0);
  const isNominal = zNoise < 0.15;

  // Read surface/context from refs inside the tick to avoid stale closures
  const surfaceRef = useRef(surface);
  const contextRef = useRef(contextState);
  const limitRef = useRef(currentLimit);
  surfaceRef.current = surface;
  contextRef.current = contextState;
  limitRef.current = currentLimit;

  useThrottledRAF(
    () => {
      // 1. Process Braking Interpolation
      if (brakingTargetRef.current !== 0) {
        brakingProgressRef.current += (brakingTargetRef.current - brakingProgressRef.current) * 0.15;
        if (Math.abs(brakingTargetRef.current - brakingProgressRef.current) < 0.01) {
          brakingTargetRef.current = 0;
        }
      } else {
        brakingProgressRef.current += (0 - brakingProgressRef.current) * 0.05;
      }

      const currentBrake = brakingProgressRef.current;
      brakeRef.current = currentBrake;

      // Check for Penalty Trigger
      if (currentBrake < limitRef.current && !penaltyTimerRef.current) {
        setPenaltyActive(true);
        setPenaltyText("PENALTY APPLIED: HARSH BRAKING DETECTED");
        penaltyTimerRef.current = window.setTimeout(() => {
          setPenaltyActive(false);
          setPenaltyText("");
          penaltyTimerRef.current = null;
        }, 3000);
      }

      // 2. Generate Noise based on Surface
      const sData = SURFACE_DATA[surfaceRef.current];
      const zAmplitude = sData.noise + (contextRef.current === 'Raining' ? 0.02 : 0);
      const newZ = 1 + (Math.random() - 0.5) * zAmplitude;
      zNoiseRef.current = zAmplitude;

      const xAmplitude = 0.01 + (zAmplitude * 0.1);
      const newX = currentBrake + (Math.random() - 0.5) * xAmplitude;

      // 3. Accumulate into refs (no React re-render)
      xHistoryRef.current.push(newX);
      if (xHistoryRef.current.length > CHART_LENGTH) xHistoryRef.current.shift();
      zHistoryRef.current.push(newZ);
      if (zHistoryRef.current.length > CHART_LENGTH) zHistoryRef.current.shift();
    },
    () => {
      // Flush to React state at ~15fps
      setBrakingG(brakeRef.current);
      setZNoise(zNoiseRef.current);
      setXHistory([...xHistoryRef.current]);
      setZHistory([...zHistoryRef.current]);
    },
    [surface, contextState]
  );

  const triggerBrake = (force: number) => {
    brakingTargetRef.current = force;
  };

  // SVG Path generator
  const createPath = (data: number[], min: number, max: number, height: number) => {
    const stepX = 100 / (CHART_LENGTH - 1);
    const range = max - min;
    
    return data.map((val, i) => {
      const x = i * stepX;
      // Invert Y so positive is up
      const clamped = Math.max(min, Math.min(max, val));
      const normalized = (clamped - min) / range;
      const y = height - (normalized * height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Convert limit to Y coordinate in SVG (ViewBox range: -1 to 0.5 for X chart)
  const limitY = 100 - (((currentLimit - (-1)) / 1.5) * 100);

  return (
    <div className="w-full h-full bg-[#f4f7f9] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div>
          <h2 className="text-slate-800 text-xl font-medium mb-1">Adaptive Telemetry Engine</h2>
          <div className="h-4">
            {penaltyActive && (
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                {penaltyText}
              </span>
            )}
          </div>
        </div>
        
        {/* Dash Stats */}
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Braking</div>
            <div className={`font-mono font-medium ${brakingG < currentLimit ? 'text-red-500' : 'text-slate-800'}`}>
              {brakingG.toFixed(2)} g
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Stability</div>
            <div className={`font-mono font-medium truncate ${isNominal ? 'text-slate-800' : 'text-orange-500'}`}>
              {isNominal ? 'NOMINAL' : 'ROUGH'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Limit</div>
            <div className="font-mono font-medium text-slate-800">
              {currentLimit > 0 ? '+' : ''}{currentLimit.toFixed(1)} g
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="bg-white rounded-2xl mx-5 mt-2 mb-4 shadow-sm border border-slate-100 overflow-hidden flex-shrink-0 flex flex-col relative h-[260px] pb-4">
        
        {/* Z-Axis Chart */}
        <div className="flex-1 relative p-4 pb-2 flex flex-col">
          <div className="text-[10px] font-bold text-slate-700 tracking-wide mb-2 shrink-0">
            Z-AXIS: VERTICAL VIBRATION (STABILITY MONITOR)
          </div>
          <div className="flex-1 w-full border-b border-slate-100 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              {/* Range: 0.5 to 1.5. Center is 1.0 */}
              <path 
                d={createPath(zHistory, 0.5, 1.5, 100)} 
                fill="none" 
                stroke="#16a34a" 
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* X-Axis Chart */}
        <div className="flex-1 relative p-4 pt-2 flex flex-col">
          <div className="text-[10px] font-bold text-slate-700 tracking-wide mb-2 shrink-0">
            X-AXIS: LONGITUDINAL FORCE (BRAKING)
          </div>
          <div className="flex-1 w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
              {/* Range: -1.0 to 0.5. Center is 0.0 */}
              
              {/* Limit Line */}
              <line x1="0" y1={limitY} x2="100" y2={limitY} stroke="#f87171" strokeWidth="1.5" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
              
              <path 
                d={createPath(xHistory, -1.0, 0.5, 100)} 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Limit Badge */}
            <div 
              className="absolute right-4 bg-white border border-red-300 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-10"
              style={{ top: `calc(${limitY}% - 12px)` }}
            >
              LIMIT: {currentLimit.toFixed(1)}G
            </div>
          </div>
        </div>

        {/* Penalty Overlay inside charts */}
        {penaltyActive && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 rounded-lg p-3 flex items-center justify-center gap-2 animate-pulse">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-700 font-bold tracking-wide text-sm">PENALTY APPLIED: HARSH BRAKING DETECTED</span>
          </div>
        )}

      </div>

      {/* Controls */}
      <div className="px-5 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-slate-600 text-sm font-medium">Surface</span>
          <select 
            className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-36 outline-none"
            value={surface}
            onChange={(e) => setSurface(e.target.value as Surface)}
          >
            {Object.keys(SURFACE_DATA).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <span className="text-slate-600 text-sm font-medium">Context</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-300">
            <button 
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${contextState === 'Dry' ? 'bg-blue-100 text-blue-700 border-r border-blue-500' : 'bg-white text-slate-600 border-r border-slate-300'}`}
              onClick={() => setContextState('Dry')}
            >
              Dry
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${contextState === 'Raining' ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-600'}`}
              onClick={() => setContextState('Raining')}
            >
              Raining
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
          <button 
            onMouseDown={() => triggerBrake(-0.3)}
            onMouseUp={() => triggerBrake(0)}
            onMouseLeave={() => triggerBrake(0)}
            onTouchStart={() => triggerBrake(-0.3)}
            onTouchEnd={() => triggerBrake(0)}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer select-none"
          >
            Normal Brake (-0.3g)
          </button>
          <button 
            onMouseDown={() => triggerBrake(-0.6)}
            onMouseUp={() => triggerBrake(0)}
            onMouseLeave={() => triggerBrake(0)}
            onTouchStart={() => triggerBrake(-0.6)}
            onTouchEnd={() => triggerBrake(0)}
            className="flex-1 bg-slate-200 hover:bg-red-200 text-slate-700 hover:text-red-800 font-medium py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer select-none"
          >
            Harsh Brake (-0.6g)
          </button>
        </div>
      </div>
    </div>
  );
}
