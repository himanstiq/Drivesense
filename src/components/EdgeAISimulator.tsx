import { useState, useEffect, useRef } from 'react';

type EventType = 'none' | 'pothole' | 'brake';

interface DataPoint {
  time: number;
  long: number;
  vert: number;
  eventType: EventType;
}

export default function EdgeAISimulator() {
  const [history, setHistory] = useState<DataPoint[]>(new Array(150).fill({ time: 0, long: 0, vert: 0, eventType: 'none' }));

  const simRef = useRef<{ type: EventType, durationMs: number, elapsedMs: number }>({ type: 'none', durationMs: 0, elapsedMs: 0 });
  const [stats, setStats] = useState({ peakLong: 0, peakVert: 0, duration: 0 });

  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      const sim = simRef.current;
      let long = (Math.random() * 0.1) - 0.05;
      let vert = (Math.random() * 0.1) - 0.05;
      let inEvent = false;

      if (sim.type !== 'none') {
        sim.elapsedMs += dt;
        if (sim.elapsedMs <= sim.durationMs) {
          inEvent = true;
          if (sim.type === 'pothole') {
            const intensity = Math.sin((sim.elapsedMs / sim.durationMs) * Math.PI * 2);
            vert += intensity * 2.5; 
          } else if (sim.type === 'brake') {
            const intensity = Math.sin((sim.elapsedMs / sim.durationMs) * Math.PI);
            long += intensity * 2.5;
          }
        } else {
          // Event finished
          sim.type = 'none';
        }
      }

      setHistory(h => {
        const next = [...h];
        next.shift();
        next.push({ time: time, long, vert, eventType: inEvent ? sim.type : 'none' });
        return next;
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute derived state from current history window
  let currentEvent: EventType = 'none';
  let activeStartIndex = -1;
  let activeEndIndex = -1;

  for (let i = 0; i < history.length; i++) {
    if (history[i].eventType !== 'none') {
      if (activeStartIndex === -1) activeStartIndex = i;
      activeEndIndex = i;
      currentEvent = history[i].eventType;
    }
  }

  useEffect(() => {
    if (currentEvent !== 'none') {
      const activePoints = history.filter(d => d.eventType === currentEvent);
      if (activePoints.length > 0) {
        setStats({
          peakLong: Math.max(...activePoints.map(d => Math.abs(d.long))),
          peakVert: Math.max(...activePoints.map(d => Math.abs(d.vert))),
          duration: currentEvent === 'pothole' ? 100 : 400
        });
      }
    } else {
       // Decay stats when idle slowly for aesthetics, or just set to 0. 
       // Keeping them as last seen is often better than resetting to 0 abruptly.
    }
  }, [history, currentEvent]);

  const clearData = () => {
    simRef.current = { type: 'none', durationMs: 0, elapsedMs: 0 };
    setHistory(new Array(150).fill({ time: 0, long: 0, vert: 0, eventType: 'none' }));
    setStats({ peakLong: 0, peakVert: 0, duration: 0 });
  };

  const triggerPothole = () => {
    simRef.current = { type: 'pothole', durationMs: 150, elapsedMs: 0 };
  };

  const triggerBrake = () => {
    simRef.current = { type: 'brake', durationMs: 400, elapsedMs: 0 };
  };

  // SVG Config
  const w = 1000;
  const h = 300;
  
  const mapY = (val: number) => h - ((val - (-3)) / 6) * h;
  const mapX = (index: number) => (index / (history.length - 1)) * w;

  const longPath = 'M ' + history.map((d, i) => `${mapX(i)},${mapY(d.long)}`).join(' L ');
  const vertPath = 'M ' + history.map((d, i) => `${mapX(i)},${mapY(d.vert)}`).join(' L ');

  const getWindowBounds = () => {
    if (activeStartIndex !== -1 && activeEndIndex !== -1) {
      return { startX: mapX(activeStartIndex), endX: mapX(activeEndIndex) };
    }
    return null;
  };
  
  const windowBounds = getWindowBounds();

  return (
    <div className="w-full bg-[#f8fafc] rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col p-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-slate-800 text-[1.1rem] font-medium tracking-tight">Telematics Edge AI Simulator</h2>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PEAK LONG.</span>
                <span className="font-mono text-slate-800 text-sm font-semibold">{stats.peakLong.toFixed(2)} g</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PEAK VERT.</span>
                <span className="font-mono text-slate-800 text-sm font-semibold">{stats.peakVert.toFixed(2)} g</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">IMPULSE DURATION</span>
                <span className="font-mono text-slate-800 text-sm font-semibold">{currentEvent !== 'none' ? stats.duration : 0} ms</span>
             </div>
          </div>
       </div>

       {/* Graph Container */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 relative">
           
           <div className="relative w-full h-[250px] mb-8">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[11px] text-slate-500 items-end pr-2 py-0">
                 <span>3</span>
                 <span>2</span>
                 <span>1</span>
                 <span>0</span>
                 <span>-1</span>
                 <span>-2</span>
                 <span>-3</span>
              </div>
              <div className="absolute left-0 top-0 -mt-4 text-[10px] font-medium text-slate-600 flex items-center gap-1">
                 <span>&uarr; G-Force</span>
              </div>

              {/* X Axis Labels */}
              <div className="absolute left-10 right-0 -bottom-6 flex justify-between text-[11px] text-slate-500 px-1">
                 <span>0</span>
                 <span>200</span>
                 <span>400</span>
                 <span>600</span>
                 <span>800</span>
                 <span>1,000</span>
                 <span className="absolute right-0 top-0 mt-5 text-[10px] font-medium text-slate-600">Time (ms) &rarr;</span>
              </div>

              <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ml-10 w-[calc(100%-2.5rem)]">
                 {/* Grid Lines */}
                 {[3, 2, 1, 0, -1, -2, -3].map(val => (
                    <line key={`grid-${val}`} x1="0" y1={mapY(val)} x2={w} y2={mapY(val)} stroke={val === 0 ? "#cbd5e1" : "#f1f5f9"} strokeWidth={val === 0 ? "1.5" : "1"} />
                 ))}

                 {/* Threshold line */}
                 <line x1="0" y1={mapY(2)} x2={w} y2={mapY(2)} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
                 <text x="30" y={mapY(2) - 8} fill="#94a3b8" fontSize="14" className="font-medium tracking-wide">RAW THRESHOLD (2.0g)</text>

                 {/* Analysis Window */}
                 {windowBounds && windowBounds.endX - windowBounds.startX > 0 && (
                    <g>
                       <rect x={windowBounds.startX} y={0} width={Math.max(10, windowBounds.endX - windowBounds.startX)} height={h} fill="#2563eb" fillOpacity="0.1" />
                       <text x={(windowBounds.startX + windowBounds.endX) / 2} y={25} textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="bold">AI ANALYSIS WINDOW</text>
                    </g>
                 )}

                 {/* Plots */}
                 <path d={longPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                 <path d={vertPath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
           </div>
           
           {/* Card below graph */}
           <div className="mt-14 mb-2 w-full h-24">
              {currentEvent === 'pothole' && (
                 <div className="rounded-xl border-[1.5px] border-[#294a40] bg-white p-5 flex gap-4 items-center shadow-sm">
                    <svg className="w-6 h-6 text-[#294a40] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex flex-col">
                       <span className="text-slate-900 font-bold text-[13px] leading-tight mb-0.5">Event Filtered</span>
                       <span className="text-slate-600 text-[13px]">High Z-Axis vibration &lt;150ms identified as Rough Road/Pothole. Zero Penalty.</span>
                    </div>
                 </div>
              )}
              {currentEvent === 'brake' && (
                 <div className="rounded-xl border-[1.5px] border-[#7f1d1d] bg-white p-5 flex gap-4 items-center shadow-sm">
                    <svg className="w-6 h-6 text-[#7f1d1d] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex flex-col">
                       <span className="text-slate-900 font-bold text-[13px] leading-tight mb-0.5">Event Registered</span>
                       <span className="text-slate-600 text-[13px]">High Longitudinal G-Force &gt;250ms identified as Harsh Braking. Penalty Applied.</span>
                    </div>
                 </div>
              )}
              {currentEvent === 'none' && (
                 <div className="rounded-xl border-[1.5px] border-slate-200 bg-slate-50/50 p-5 flex gap-4 items-center shadow-sm opacity-60">
                    <svg className="w-6 h-6 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex flex-col">
                       <span className="text-slate-700 font-bold text-[13px] leading-tight mb-0.5">System Idle</span>
                       <span className="text-slate-500 text-[13px]">Monitoring telemetry stream for anomalies...</span>
                    </div>
                 </div>
              )}
           </div>

       </div>

       {/* Controls */}
       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 px-2">
          <div className="flex items-center gap-3 w-full pr-0 md:pr-4">
             <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Processing Unit</span>
             <select className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg flex-1 p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option>DriveSense BNO085</option>
                <option>ICM-20948 IMU Core</option>
             </select>
          </div>
          
          <button onClick={triggerPothole} className="w-full bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-[10px] px-4 rounded-xl text-sm transition-colors">
             Trigger Pothole Event
          </button>

          <button onClick={triggerBrake} className="w-full bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-[10px] px-4 rounded-xl text-sm transition-colors">
             Trigger Harsh Brake
          </button>

          <button onClick={clearData} className="w-full bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-[10px] px-4 rounded-xl text-sm transition-colors">
             Clear Data
          </button>
       </div>

    </div>
  )
}
