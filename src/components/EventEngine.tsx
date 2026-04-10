import { useState, useRef } from 'react';
import { useThrottledRAF } from '../hooks/useThrottledRAF';

export default function EventEngine() {
  const [currentG, setCurrentG] = useState(0);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [penalties, setPenalties] = useState(1); // Set initial to 1 to match snapshot
  const [isBraking, setIsBraking] = useState(false);
  const [systemMsg, setSystemMsg] = useState("Engine Idle: Monitoring G-sensor.");

  // Graph History (200 points for smooth scrolling)
  const [history, setHistory] = useState<number[]>(new Array(200).fill(0));

  const THRESHOLD = 0.4;
  const DEBOUNCE_TARGET = 100; // ms to confirm event

  // Simulation ref
  const simRef = useRef<{ active: boolean, targetG: number, duration: number, startTime: number | null }>({
    active: false, targetG: 0, duration: 0, startTime: null
  });
  
  // State machine logic
  const stateRef = useRef({ accum: 0, penaltyFired: false });

  // Mutable refs for high-frequency data
  const historyRef = useRef<number[]>(new Array(200).fill(0));
  const gRef = useRef(0);
  const accumRef = useRef(0);
  const brakingRef = useRef(false);
  const lastTimeRef = useRef(performance.now());

  useThrottledRAF(
    () => {
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      let nextG = 0;
      const sim = simRef.current;
      
      if (sim.active) {
        if (sim.startTime === null) sim.startTime = now;
        const elapsed = now - sim.startTime;
        if (elapsed < sim.duration) {
          nextG = sim.targetG + (Math.random() * 0.04 - 0.02);
        } else {
          sim.active = false;
        }
      } else {
        nextG = Math.random() * 0.01;
      }

      const isOver = nextG >= THRESHOLD;
      if (isOver) {
        stateRef.current.accum += dt;
        if (stateRef.current.accum >= DEBOUNCE_TARGET && !stateRef.current.penaltyFired) {
          setPenalties(p => p + 1);
          stateRef.current.penaltyFired = true;
          setSystemMsg("PENALTY RECORDED: Harsh event confirmed.");
        } else if (!stateRef.current.penaltyFired) {
          setSystemMsg(`WARNING: Exceeded threshold. Debouncing: ${Math.floor(stateRef.current.accum)}ms`);
        }
      } else {
        if (stateRef.current.accum > 0) {
          if (stateRef.current.penaltyFired) {
            setSystemMsg("Engine Idle: Returning to baseline.");
          } else {
            setSystemMsg("Engine Idle: Transient ignored (debounce failed).");
          }
        }
        stateRef.current.accum = 0;
        stateRef.current.penaltyFired = false;
      }

      gRef.current = nextG;
      accumRef.current = Math.floor(stateRef.current.accum);
      brakingRef.current = isOver;

      historyRef.current.push(nextG);
      if (historyRef.current.length > 200) historyRef.current.shift();
    },
    () => {
      // Flush to React state at ~15fps
      setCurrentG(gRef.current);
      setAccumulatedTime(accumRef.current);
      setIsBraking(brakingRef.current);
      setHistory([...historyRef.current]);
    },
    []
  );

  const triggerPothole = () => {
    simRef.current = { active: true, targetG: 0.8, duration: 50, startTime: null };
  };

  const triggerHarshBrake = () => {
    simRef.current = { active: true, targetG: 0.5, duration: 300, startTime: null };
  };

  const clearStats = () => {
    setPenalties(0);
    stateRef.current.accum = 0;
    stateRef.current.penaltyFired = false;
    setAccumulatedTime(0);
    setSystemMsg("Engine Idle: Monitoring G-sensor.");
  };

  // Build SVG path
  const width = 600;
  const height = 150;
  
  // Max G to plot
  const maxGPlot = 1;
  const points = history.map((val, i) => {
    const x = (i / (history.length - 1)) * width;
    const yBaseline = height - 10;
    const yTop = 10;
    const y = yBaseline - (Math.min(Math.max(val, 0), maxGPlot) / maxGPlot) * (yBaseline - yTop);
    return `${x},${y}`;
  });
  
  const pathD = `M ${points.join(' L ')}`;
  
  // Calculate threshold Y pixel
  const yBaseline = height - 10;
  const yTop = 10;
  const targetThresholdPixels = Math.max(0, Math.min(THRESHOLD, maxGPlot));
  const threshY = yBaseline - (targetThresholdPixels / maxGPlot) * (yBaseline - yTop);

  return (
    <div className="w-full h-full bg-[#f0f4f8] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col pt-2">
      {/* Header */}
      <div className="p-6 pb-4 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <h2 className="text-slate-800 text-[1.1rem] font-medium tracking-tight px-2">ESP32 Event Engine: Threshold Detection</h2>
        
        {/* Top Right Stats Ribbon */}
        <div className="flex flex-wrap gap-4 lg:gap-6 mt-2 xl:mt-0 px-2 lg:px-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CURRENT G</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{currentG.toFixed(2)} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACCUMULATED TIME</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{accumulatedTime} ms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PENALTIES</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{penalties}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl mx-6 mb-4 shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-5">
          <h3 className="text-slate-800 font-semibold mb-6">Longitudinal G-Force (Telematics Feed)</h3>
          
          {/* Graph Area */}
          <div className="relative w-full h-[180px] bg-slate-100/50 rounded-xl overflow-hidden mb-6">
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
               {/* Threshold line */}
               <line x1="0" y1={threshY} x2={width} y2={threshY} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="6,4" />
               {/* Base 0 line */}
               <line x1="0" y1={yBaseline} x2={width} y2={yBaseline} stroke="#cbd5e1" strokeWidth="2" />
               {/* Dynamic Plot */}
               <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            
            {/* Threshold Pill Overlay */}
            <div 
              className="absolute left-6 px-3 py-1 bg-white border border-[#dc2626] text-[#dc2626] text-xs font-bold rounded-full shadow-sm flex items-center"
              style={{ top: `${(threshY/height)*100}%`, transform: 'translateY(-50%)' }}
            >
              THRESHOLD: {THRESHOLD}G
            </div>
          </div>

          {/* MCU State Table */}
          <div className="w-full">
            <div className="font-mono text-xs text-slate-500 mb-2">MCU_STATE: ESP32_EVENT_ENGINE_0x3F40</div>
            
            <div className="w-full font-mono text-sm grid grid-cols-12 gap-y-1 py-1 border-b border-slate-100 items-center">
               <div className="col-span-3 text-slate-500">0x3FFB0004</div>
               <div className="col-span-2 text-blue-600">float</div>
               <div className="col-span-5 text-slate-800 font-semibold">live_g_force</div>
               <div className="col-span-2 text-right text-slate-800 font-bold">{currentG.toFixed(4)}</div>
            </div>
            <div className="w-full font-mono text-sm grid grid-cols-12 gap-y-1 py-1 border-b border-slate-100 items-center">
               <div className="col-span-3 text-slate-500">0x3FFB0008</div>
               <div className="col-span-2 text-blue-600">bool</div>
               <div className="col-span-5 text-slate-800 font-semibold">is_braking</div>
               <div className="col-span-2 text-right text-slate-800 font-bold">{isBraking ? 'TRUE' : 'FALSE'}</div>
            </div>
            <div className="w-full font-mono text-sm grid grid-cols-12 gap-y-1 py-1 border-b border-slate-100 items-center">
               <div className="col-span-3 text-slate-500">0x3FFB000C</div>
               <div className="col-span-2 text-blue-600">uint32</div>
               <div className="col-span-5 text-slate-800 font-semibold">debounce_timer_ms</div>
               <div className="col-span-2 text-right text-slate-800 font-bold">{accumulatedTime}</div>
            </div>
            <div className="w-full font-mono text-sm grid grid-cols-12 gap-y-1 py-1 border-b border-slate-200 items-center">
               <div className="col-span-3 text-slate-500">0x3FFB0010</div>
               <div className="col-span-2 text-blue-600">uint16</div>
               <div className="col-span-5 text-slate-800 font-semibold">penalty_count</div>
               <div className="col-span-2 text-right text-slate-800 font-bold">{penalties}</div>
            </div>

            <div className="text-xs text-slate-600 mt-2">System Message: <span className="font-medium">{systemMsg}</span></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 pt-0 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={triggerPothole}
            className="flex-1 bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
          >
            Simulate Pothole (High G, 50ms)
          </button>
          <button 
            onClick={triggerHarshBrake}
            className="flex-1 bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
          >
            Simulate Harsh Brake (Med G, 300ms)
          </button>
        </div>
        <button 
          onClick={clearStats}
          className="w-full bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
        >
          Clear Stats
        </button>
      </div>
    </div>
  );
}
