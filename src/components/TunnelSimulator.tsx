import { useState, useEffect, useRef } from 'react';
import { Bike } from 'lucide-react';

export default function TunnelSimulator() {
    const [time, setTime] = useState(0);
    const [simulating, setSimulating] = useState(false);
    const [mode, setMode] = useState('OPEN AIR');
    const [gpsRel, setGpsRel] = useState('100%');
    const [signal, setSignal] = useState('OK');

    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const simulationDuration = 10; // seconds

    const runSimulation = (timeNow: number) => {
        if (!startTimeRef.current) startTimeRef.current = timeNow;
        const elapsed = (timeNow - startTimeRef.current) / 1000;

        if (elapsed > simulationDuration) {
            setTime(simulationDuration);
            setSimulating(false);
            setMode('OPEN AIR');
            setGpsRel('100%');
            setSignal('OK');
            startTimeRef.current = 0;
            return;
        }

        setTime(elapsed);

        // Tunnel logic: enter at 2s, exit at 8s
        if (elapsed >= 2 && elapsed <= 8) {
            setMode('TUNNEL');
            setGpsRel('0%');
            setSignal('LOST');
        } else {
            setMode('OPEN AIR');
            setGpsRel('100%');
            setSignal('OK');
        }

        requestRef.current = requestAnimationFrame(runSimulation);
    };

    useEffect(() => {
        if (simulating) {
            requestRef.current = requestAnimationFrame(runSimulation);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = 0;
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [simulating]);

    const startSimulation = () => {
        if (!simulating) {
            setTime(0);
            startTimeRef.current = 0;
            setSimulating(true);
        }
    };

    // Calculate bike position
    // Bike moves from left (0%) to right (100%) over simulationDuration
    const bikeLeftPercent = (time / simulationDuration) * 100;

    // We can draw the chart paths dynamically based on full length, 
    // and animate a 'clipPath' or mask if we want it to reveal, but the image shows the full chart generated or mapped out.
    // The prompt shows an axis up to 160 on Y and 10 on X.

    // Draw lines
    const chartWidth = 1000;
    const chartHeight = 300;

    // Mapping functions
    const mapX = (t: number) => (t / simulationDuration) * chartWidth;
    const mapY = (val: number) => chartHeight - (val / 160) * chartHeight;

    // Generate Path Data for the two lines
    // At t=2 drops, at t=8 rises

    // Connectivity (Blue line): 100 -> 20 -> 100
    const connectivityPath = `
        M ${mapX(0)} ${mapY(100)} 
        L ${mapX(2)} ${mapY(100)} 
        L ${mapX(2)} ${mapY(20)} 
        L ${mapX(8)} ${mapY(20)} 
        L ${mapX(8)} ${mapY(100)} 
        L ${mapX(10)} ${mapY(100)}
    `;

    // Data Stream (Green line): 100 -> 50 -> 100
    const dataStreamPath = `
        M ${mapX(0)} ${mapY(100)} 
        L ${mapX(2)} ${mapY(100)} 
        L ${mapX(2)} ${mapY(50)} 
        L ${mapX(8)} ${mapY(50)} 
        L ${mapX(8)} ${mapY(100)} 
        L ${mapX(10)} ${mapY(100)}
    `;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full h-full font-sans">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Tunnel Blackout Dashboard</h2>
                    <p className="text-sm font-medium text-slate-600">
                        SYSTEM NOMINAL: GPS penalties suspended. IMU harsh brake computed on Edge. Data securely cached.
                    </p>
                </div>
                {/* Stats Grid */}
                <div className="flex gap-4 shrink-0 mt-2 sm:mt-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{time.toFixed(1)}s</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mode</span>
                        <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{mode}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GPS Rel.</span>
                        <span className="text-sm font-bold text-slate-800">{gpsRel}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Signal</span>
                        <span className="text-sm font-bold text-slate-800">{signal}</span>
                    </div>
                </div>
            </div>

            {/* Inner Content Padding */}
            <div className="p-6 grow flex flex-col">

                {/* Visualizer Block (Tunnel) */}
                <div className="w-full h-48 bg-[#f4f6fb] rounded-md relative overflow-hidden mb-6 flex flex-col justify-center border border-slate-100">
                    {/* Tunnel Zone (2s to 8s translates to 20% to 80% visually in length) */}
                    <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-slate-200 border-x border-slate-400 opacity-60 flex items-center justify-center">
                        <span className="text-2xl font-light tracking-[0.5em] text-slate-500 uppercase z-10">Tunnel</span>
                    </div>

                    {/* Road Band */}
                    <div className="absolute left-0 right-0 h-16 bg-slate-300 top-1/2 -translate-y-1/2"></div>

                    <div
                        className="absolute h-12 w-16 -ml-8 top-1/2 -translate-y-1/2 text-blue-500 bg-white shadow-sm border border-blue-200 rounded-md flex items-center justify-center z-20"
                        style={{ left: `${bikeLeftPercent}%` }}
                    >
                        <Bike size={24} />
                    </div>
                </div>

                {/* Graph Title */}
                {/* Omitted Title in original image to keep it clean */}
                <div className="w-full flex-grow relative pb-8">
                    {/* Y-Axis Label */}
                    <div className="absolute top-0 left-0 text-xs text-slate-600">↑ Value</div>

                    {/* SVG Chart */}
                    <svg viewBox="0 0 1000 300" className="w-full h-auto overflow-visible" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        {[0, 20, 40, 60, 80, 100, 120, 140, 160].map(y => (
                            <g key={y}>
                                <line x1="0" y1={mapY(y)} x2="1000" y2={mapY(y)} stroke="#f1f5f9" strokeWidth="1" />
                                <text x="-15" y={mapY(y)} textAnchor="end" dominantBaseline="middle" fill="#64748b" fontSize="12">{y}</text>
                            </g>
                        ))}

                        {/* X-Axis Grid and specific event markers */}
                        {[0, 2, 4, 6, 8, 10].map(x => (
                            <line key={x} x1={mapX(x)} y1="0" x2={mapX(x)} y2="300" stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        {/* Vertical Event Lines */}
                        <line x1={mapX(2)} y1="0" x2={mapX(2)} y2="320" stroke="#334155" strokeWidth="2" />
                        <text x={mapX(2)} y="30" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="500">Tunnel Start</text>

                        <line x1={mapX(5)} y1="0" x2={mapX(5)} y2="320" stroke="#334155" strokeWidth="2" />
                        <text x={mapX(5)} y="30" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="500">Harsh Brake</text>

                        <line x1={mapX(8)} y1="0" x2={mapX(8)} y2="320" stroke="#334155" strokeWidth="2" />
                        <text x={mapX(8)} y="30" textAnchor="middle" fill="#475569" fontSize="14" fontWeight="500">Exit Tunnel</text>

                        {/* X-Axis Labels */}
                        {[0, 2, 4, 6, 8, 10].map(x => (
                            <text key={x} x={mapX(x)} y="325" textAnchor="middle" fill="#64748b" fontSize="14">{x}</text>
                        ))}
                        <text x="1000" y="345" textAnchor="end" fill="#64748b" fontSize="14">Time (s) →</text>

                        {/* Data Lines */}
                        {/* Clip Path for Revealer Animation */}
                        <clipPath id="chart-revealer">
                            <rect x="0" y="0" width={mapX(time)} height="400" />
                        </clipPath>

                        <g clipPath="url(#chart-revealer)">
                            {/* Blue Line */}
                            <path d={connectivityPath} fill="none" stroke="#3b82f6" strokeWidth="3" />
                            {/* Green Line */}
                            <path d={dataStreamPath} fill="none" stroke="#22c55e" strokeWidth="3" />
                        </g>

                        {/* Full trace hints (faded) underneath so you can see full path BEFORE simulation */}
                        {!simulating && time === 0 && (
                            <g opacity="0.3">
                                <path d={connectivityPath} fill="none" stroke="#3b82f6" strokeWidth="3" />
                                <path d={dataStreamPath} fill="none" stroke="#22c55e" strokeWidth="3" />
                            </g>
                        )}

                        {/* Legend text inside chart area */}
                        <text x={mapX(8) + 10} y={mapY(70)} fill="#475569" fontSize="14" fontWeight="500">Connectivity</text>
                        <text x={mapX(8) + 10} y={mapY(110)} fill="#475569" fontSize="14" fontWeight="500">Data Stream</text>
                    </svg>
                </div>

            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">Device Profile</span>
                    <select className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64">
                        <option>DriveSense Edge-AI (BL...)</option>
                        <option>Cloud Computed Tracker</option>
                    </select>
                </div>

                <button
                    onClick={startSimulation}
                    disabled={simulating}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-full transition-colors disabled:opacity-50 min-w-[200px]"
                >
                    {simulating ? 'Simulating...' : 'Start Tunnel Simulation'}
                </button>
            </div>
        </div>
    );
}
