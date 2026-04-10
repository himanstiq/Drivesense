import { useState, useRef, memo, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// 1. The 3D Object handling its own interpolation from a mutable ref
function IMUModel({ dataRef }: { dataRef: MutableRefObject<any> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const d = dataRef.current;

    // Smoothly damp position
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, d.accX, 10, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, d.accZ, 10, delta);
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, -d.accY, 10, delta);

    // Smoothly slerp rotation using Quaternion
    const pRad = (d.pitch * Math.PI) / 180;
    const rRad = (d.roll * Math.PI) / 180;
    const yRad = (d.yaw * Math.PI) / 180;

    const targetEuler = new THREE.Euler(pRad, yRad, rRad);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
    groupRef.current.quaternion.slerp(targetQuat, 10 * delta);
  });

  return (
    <group ref={groupRef}>
      {/* PCB Body */}
      <mesh>
        <boxGeometry args={[2, 0.2, 1.5]} />
        <meshStandardMaterial color="#0b1e42" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Chip */}
      <mesh position={[0.4, 0.15, 0.2]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Axes Helper */}
      <axesHelper args={[2.5]} />
    </group>
  );
}

// 2. Memoize the entire Canvas tree so it never re-reads during React state DOM changes
const SceneContainer = memo(({ dataRef }: { dataRef: MutableRefObject<any> }) => {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />

      <Grid infiniteGrid fadeDistance={20} sectionColor="#cbd5e1" cellColor="#e2e8f0" position={[0, -2, 0]} />

      <IMUModel dataRef={dataRef} />

      <OrbitControls makeDefault />
    </Canvas>
  );
});

// Avoid React warning about missing display name
SceneContainer.displayName = "SceneContainer";

export default function IMUSimulator() {
  const [accX, setAccX] = useState(0);
  const [accY, setAccY] = useState(0);
  const [accZ, setAccZ] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [yaw, setYaw] = useState(0);

  // Maintain a synchronized shared ref for the 3D loop
  const dataRef = useRef({ accX, accY, accZ, pitch, roll, yaw });

  // Update both the React UI DOM and the 3D loop bypassing reconciliation
  const updateState = (key: string, val: number, setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(val);
    (dataRef.current as any)[key] = val;
  };

  const reset = () => {
    updateState('accX', 0, setAccX);
    updateState('accY', 0, setAccY);
    updateState('accZ', 0, setAccZ);
    updateState('pitch', 0, setPitch);
    updateState('roll', 0, setRoll);
    updateState('yaw', 0, setYaw);
  };

  const SliderControl = ({ label, value, stateKey, setter, min, max, step }: any) => (
    <div className="flex items-center gap-2 lg:gap-4 py-1">
      <span className="text-slate-600 text-sm font-medium w-28 lg:w-32 shrink-0 text-right pr-2">{label}</span>
      <div className="relative flex-1 flex items-center">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => updateState(stateKey, Number(e.target.value), setter)}
          className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#1a56db]"
        />
      </div>
      <div className="w-12 lg:w-14 bg-white border border-slate-300 rounded-xl text-center py-[2px] text-sm font-medium text-slate-800 shrink-0">
        {value}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-[#f0f4f8] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col pt-2">
      {/* Header */}
      <div className="p-6 pb-4 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <h2 className="text-slate-800 text-[1.1rem] font-medium tracking-tight px-2">IMU Simulator</h2>

        {/* Top Right Stats Ribbon */}
        <div className="flex flex-wrap gap-4 lg:gap-6 mt-2 xl:mt-0 px-2 lg:px-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACC X</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{accX.toFixed(2)} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACC Y</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{accY.toFixed(2)} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACC Z</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{accZ.toFixed(2)} g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ROLL</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{roll}&deg;</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">PITCH</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{pitch}&deg;</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">YAW</span>
            <span className="font-mono font-medium text-slate-800 text-sm">{yaw}&deg;</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas View - Fully Memoized */}
      <div className="bg-white rounded-2xl mx-6 mb-4 shadow-sm border border-slate-100 overflow-hidden relative h-[300px]">
        <SceneContainer dataRef={dataRef} />
      </div>

      {/* Controls Container */}
      <div className="px-6 pb-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <SliderControl label="Accel X (Fwd)" stateKey="accX" setter={setAccX} min={-2} max={2} step={0.1} value={accX} />
          <SliderControl label="Accel Y (Lat)" stateKey="accY" setter={setAccY} min={-2} max={2} step={0.1} value={accY} />
          <SliderControl label="Accel Z (Vert)" stateKey="accZ" setter={setAccZ} min={-2} max={2} step={0.1} value={accZ} />
          <SliderControl label="Pitch (Tilt)" stateKey="pitch" setter={setPitch} min={-90} max={90} step={1} value={pitch} />
          <SliderControl label="Roll (Lean)" stateKey="roll" setter={setRoll} min={-90} max={90} step={1} value={roll} />
          <SliderControl label="Yaw (Turn)" stateKey="yaw" setter={setYaw} min={-90} max={90} step={1} value={yaw} />
        </div>

        <div className="mt-5 w-full">
          <button
            onClick={reset}
            className="w-full bg-[#dde2eb] hover:bg-[#c9d0db] text-slate-700 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
          >
            Reset Sensors
          </button>
        </div>
      </div>
    </div>
  );
}
