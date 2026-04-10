import { useState, useEffect, useRef } from 'react';

type EventType = 'none' | 'weaving';

interface DataPoint {
  time: number;
  lean: number;
  eventType: EventType;
}

export default function WeavingSimulator() {
  const windowMs = 3000;
  const fps = 60;
  const historySize = (windowMs / 1000) * fps; // 180 points
  
  const [history, setHistory] = useState<DataPoint[]>(new Array(historySize).fill({ time: 0, lean: 0, eventType: 'none' }));
  const simRef = useRef<{ type: EventType, durationMs: number, elapsedMs: number }>({ type: 'none', durationMs: 0, elapsedMs: 0 });


  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      const sim = simRef.current;
      let lean = (Math.random() * 2) - 1; // Base noise
      let inEvent = false;

      if (sim.type !== 'none') {
        sim.elapsedMs += dt;
        if (sim.elapsedMs <= sim.durationMs) {
          inEvent = true;
          if (sim.type === 'weaving') {
            // High amplitude sine wave to simulate weaving, period = 1000ms
            const intensity = Math.sin((sim.elapsedMs / 1000) * Math.PI * 2);
            lean += Math.min(35, Math.max(-35, intensity * 35));
          }
        } else {
          sim.type = 'none'; // finish
        }
      }

      setHistory(h => {
        const next = [...h];
        next.shift();
        next.push({ time: time, lean, eventType: inEvent ? sim.type : 'none' });
        return next;
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute derived state
  let currentEvent: EventType = 'none';
  let isWeavingDetected = false;

  for (let i = 0; i < history.length; i++) {
    if (history[i].eventType !== 'none') {
      currentEvent = history[i].eventType;
    }
    if (Math.abs(history[i].lean) >= 25 && history[i].eventType === 'weaving') {
      isWeavingDetected = true;
    }
  }

  // Update Stats at a reasonable rate (not 60fps to avoid React thrashing, but here we hook it softly or just use latest history point)
  const latest = history[history.length - 1];

  const triggerWeaving = () => {
    simRef.current = { type: 'weaving', durationMs: 3000, elapsedMs: 0 };
  };

  // SVG Config
  const w = 1000;
  const h = 300;
  
  const mapY = (val: number) => h / 2 - (val / 50) * (h / 2) + 20; // 0 is middle, scale is 50
  const mapX = (index: number) => (index / (history.length - 1)) * w;

  const leanPath = 'M ' + history.map((d, i) => `${mapX(i)},${mapY(d.lean)}`).join(' L ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full h-full">
       
       {/* Header */}
       <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
             <h3 className="text-xl font-bold text-slate-800">Motorcycle Telemetry Dashboard</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6 items-center">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">TIME</span>
                <span className="font-mono text-slate-800 text-sm font-semibold">3.00s</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">VALUE</span>
                <span className="font-mono text-slate-800 text-sm font-semibold">{latest.lean.toFixed(2)}°</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ALERT</span>
                <span className={`font-mono text-sm font-semibold flex items-center gap-1 ${currentEvent !== 'none' ? 'text-amber-500' : 'text-slate-400'}`}>
                   {currentEvent !== 'none' && <span className="text-lg leading-none">⚠️</span>}
                   {currentEvent !== 'none' ? 'ACTIVE' : 'IDLE'}
                </span>
             </div>
          </div>
       </div>

       {/* Graph Area */}
       <div className="p-6 pb-2 relative h-[350px]">
          
          <svg viewBox={`0 0 ${w} ${h + 40}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
             {/* Grid & Axes */}
             {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((val, i) => {
                 const y = mapY(val);
                 return (
                     <g key={`y-${i}`}>
                        <line x1="0" y1={y} x2={w} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={val === 0 ? "none" : "4,4"} />
                        <text x="-10" y={y + 4} textAnchor="end" fill="#64748b" fontSize="12">{val}</text>
                     </g>
                 );
             })}
             
             {/* Time Axis (X) */}
             {[0, 500, 1000, 1500, 2000, 2500, 3000].map((val, i) => {
                 const x = (val / 3000) * w;
                 return (
                     <g key={`x-${i}`}>
                        <line x1={x} y1={mapY(-50)} x2={x} y2={mapY(-50) + 5} stroke="#cbd5e1" strokeWidth="2" />
                        <text x={x} y={mapY(-50) + 20} textAnchor="middle" fill="#64748b" fontSize="12">{val}ms</text>
                     </g>
                 );
             })}

             {/* Threshold Limits */}
             <line x1="0" y1={mapY(25)} x2={w} y2={mapY(25)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6"/>
             <line x1="0" y1={mapY(-25)} x2={w} y2={mapY(-25)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6"/>
             
             {/* Main Trace */}
             <path d={leanPath} fill="none" stroke="#b91c1c" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>

          {/* Y Axis Label */}
          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-slate-500 tracking-wide">
             Lean Angle (Degrees)
          </div>

          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-500 tracking-wide">
             Time (ms)
          </div>
       </div>

       {/* Analysis Status */}
       <div className="mx-6 mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[140px] transition-colors duration-300">
           {isWeavingDetected ? (
               <>
                 <p className="text-slate-700 text-lg mb-4 font-medium">ANALYSIS: Violent Roll-Axis oscillation detected.</p>
                 <div className="bg-red-700 text-white px-6 py-3 rounded-xl shadow-md w-full max-w-2xl text-center">
                    <span className="text-2xl font-bold tracking-tight">STATUS: Aggressive Weaving (Penalty Applied)</span>
                 </div>
               </>
           ) : (
               <>
                 <p className="text-slate-500 text-lg mb-4 font-medium">ANALYSIS: System Idle. Waiting for aggressive leaning...</p>
                 <div className="bg-slate-200 text-slate-500 px-6 py-3 rounded-xl w-full max-w-2xl text-center">
                    <span className="text-2xl font-bold tracking-tight">STATUS: Nominal</span>
                 </div>
               </>
           )}
       </div>

       {/* Controls Area */}
       <div className="mt-auto p-4 bg-slate-100 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
             
             <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">Sensor System</span>
                <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm min-w-[200px]">
                   <option>DriveSense (Roll Axis Kinematics)</option>
                   <option>Basic IMU</option>
                </select>
             </div>

             <div className="flex-1"></div>

             <button 
                onClick={triggerWeaving}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm active:scale-95"
             >
               Simulate Zig-Zag Weaving
             </button>

          </div>
       </div>
       
    </div>
  );
}
