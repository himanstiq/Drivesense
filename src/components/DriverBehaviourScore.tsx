import { useState } from 'react';

const WEIGHTS = {
  acc: 20,
  corner: 35,
  zigzag: 30,
  speeding: 7,
  rollover: 200,
};

// Stable slider component – defined outside render so React never remounts it mid-drag
const SliderControl = ({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max: number }) => (
  <div className="flex items-center gap-4 py-1">
    <span className="text-slate-600 text-sm font-medium w-36 shrink-0">{label}</span>
    <div className="relative flex-1 flex items-center">
      <input 
        type="range" 
        min="0" 
        max={max} 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
        className="w-full" 
      />
    </div>
    <div className="w-14 bg-white border border-slate-300 rounded-xl text-center py-[2px] text-sm font-medium text-slate-800">
      {value}
    </div>
  </div>
);

export default function DriverBehaviourScore() {
  const [acc, setAcc] = useState(0);
  const [corner, setCorner] = useState(2);
  const [zigzag, setZigzag] = useState(0);
  const [speeding, setSpeeding] = useState(1);
  const [rollover, setRollover] = useState(0);

  const penalty = (acc * WEIGHTS.acc) + (corner * WEIGHTS.corner) + (zigzag * WEIGHTS.zigzag) + (speeding * WEIGHTS.speeding) + (rollover * WEIGHTS.rollover);
  const baseScore = 900;
  const distFactor = 1.00;
  const score = Math.max(0, Math.round(baseScore - (penalty * distFactor)));
  
  let status = "POOR";
  let statusColor = "text-red-600";
  let barColor = "bg-[#448b11]"; // Default to the green from the screenshot
  if (score < 400) {
    status = "POOR";
    statusColor = "text-red-600";
    barColor = "bg-red-600";
  } else if (score < 750) {
    status = "AVERAGE";
    statusColor = "text-orange-500";
    barColor = "bg-orange-500";
  } else {
    status = "GOOD";
    statusColor = "text-green-700";
    barColor = "bg-[#3f8c14]"; 
  }

  const progressPercent = (score / 900) * 100;

  const reset = () => {
    setAcc(0); setCorner(0); setZigzag(0); setSpeeding(0); setRollover(0);
  };

  return (
    <div className="w-full h-full bg-[#f0f4f8] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col pt-2">
      {/* Header */}
      <div className="p-6 pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <h2 className="text-slate-800 text-[1.1rem] font-medium tracking-tight px-2">Driver Behaviour Score</h2>
        
        {/* Top Right Stats */}
        <div className="flex gap-6 mt-2 md:mt-0 px-2 lg:px-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Penalty</span>
            <span className="font-mono font-medium text-slate-900">{penalty}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Norm. Factor</span>
            <span className="font-mono font-medium text-slate-900">{distFactor.toFixed(2)}x</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</span>
            <span className={`font-bold ${statusColor} capitalize`}>{status.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl mx-6 mb-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center pt-10 pb-8 relative">
        <h3 className="text-slate-600 font-medium text-lg mb-2">Final DBS Score</h3>
        <div className={`text-4xl font-bold mb-3 ${statusColor}`}>
          {score}
        </div>
        <div className={`border-2 rounded-full px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-8 
          ${score >= 750 ? 'border-green-600 text-green-700' : score >= 400 ? 'border-orange-500 text-orange-600' : 'border-red-600 text-red-600'}
        `}>
          {status}
        </div>

        {/* Progress Bar Area */}
        <div className="w-full max-w-sm px-6 relative mb-6">
          {/* Tick markers */}
          <div className="absolute top-[-8px] bottom-[-8px] left-6 right-6 pointer-events-none">
            <div className="absolute left-[40%] top-0 bottom-0 border-l border-dashed border-slate-300" />
            <div className="absolute left-[75%] top-0 bottom-0 border-l border-dashed border-slate-300" />
          </div>

          {/* Bar Background */}
          <div className="w-full h-10 bg-slate-200 rounded-full relative overflow-hidden">
            {/* Active Fill */}
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between text-slate-600 text-sm mt-3 relative">
            <span className="absolute left-0">0</span>
            <span className="absolute left-[38%] translate-x-[-50%]">Poor</span>
            <span className="absolute left-[72%] translate-x-[-50%] text-slate-500">Average</span>
            <span className="absolute right-0 text-slate-500">Good</span>
          </div>
        </div>

        <div className="text-sm font-medium text-[#7fb15b]">
          Score = {baseScore} - ({penalty} pts &times; {distFactor.toFixed(2)} dist. factor)
        </div>
      </div>

      {/* Constraints & Controls */}
      <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
        <SliderControl label="Harsh Acceleration" max={10} value={acc} onChange={setAcc} />
        <SliderControl label="Sharp Cornering" max={10} value={corner} onChange={setCorner} />
        <SliderControl label="Over-speeding (min)" max={60} value={speeding} onChange={setSpeeding} />
        <SliderControl label="Zig-zag Instability" max={10} value={zigzag} onChange={setZigzag} />
        <SliderControl label="Rollover Count" max={3} value={rollover} onChange={setRollover} />
        
        <div className="flex items-center pt-1 md:pt-0">
          <button 
            onClick={reset}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors"
          >
            Reset Trip
          </button>
        </div>
      </div>

    </div>
  );
}
