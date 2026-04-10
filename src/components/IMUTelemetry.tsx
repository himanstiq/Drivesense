import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useThrottledRAF } from '../hooks/useThrottledRAF';

type Maneuver = 'Idle' | 'Hard Braking' | 'Sharp Left' | 'Sharp Right' | 'Wheelie';

interface Telemetry {
  acc: [number, number, number];
  gyro: [number, number, number];
  mag: [number, number, number];
}

// Bike body lies along X-axis: rotation.x = ROLL (lean), rotation.z = PITCH (nose up/down), rotation.y = YAW (turn)
const targetRotations: Record<Maneuver, [number, number, number]> = {
  'Idle': [0, 0, 0],
  'Hard Braking': [0, 0, -0.45],       // Nose dips down — rider pitches forward over handlebars
  'Sharp Left': [0.50, 0.25, 0],       // Lean left + slight yaw left
  'Sharp Right': [-0.50, -0.25, 0],    // Lean right + slight yaw right
  'Wheelie': [0, 0, 0.65]              // Front lifts up
};

const baseline: Telemetry = {
  acc: [-0.02, 0.06, 1.02],
  gyro: [0.0, -0.2, 0.0],
  mag: [1.00, 0.00, 0.00]
};

const targets: Record<Maneuver, Telemetry> = {
  'Idle': baseline,
  'Hard Braking': {
    acc: [0.05, -0.2, -1.8],
    gyro: [0.0, 65.2, 0.0],
    mag: [1.00, 0.00, 0.00]
  },
  'Sharp Left': {
    acc: [-1.2, 0.06, 1.0],
    gyro: [-60.1, 0.0, 85.5],
    mag: [0.5, 0.8, 0.00]
  },
  'Sharp Right': {
    acc: [1.2, 0.06, 1.0],
    gyro: [60.3, 0.0, -85.2],
    mag: [0.5, -0.8, 0.00]
  },
  'Wheelie': {
    acc: [0.0, 1.5, 0.8],
    gyro: [0.0, -110.5, 0.0],
    mag: [1.00, 0.00, 0.00]
  }
};

const IMUBlockModel = ({ maneuver }: { maneuver: Maneuver }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const target = targetRotations[maneuver];
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, target[0], 4, delta);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target[1], 4, delta);
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, target[2], 4, delta);
  });

  return (
    <group ref={groupRef} scale={1.6}>
      {/* Main PCB Body — elongated along X */}
      <mesh>
        <boxGeometry args={[4.5, 0.3, 2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Front indicator (yellow band = heading direction) */}
      <mesh position={[2.4, 0, 0]}>
        <boxGeometry args={[0.25, 0.25, 1.6]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Chip on top */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.0, 0.12, 0.8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Small markings / pads */}
      <mesh position={[-1.5, 0.18, 0.5]}>
        <boxGeometry args={[0.3, 0.06, 0.3]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-1.5, 0.18, -0.5]}>
        <boxGeometry args={[0.3, 0.06, 0.3]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {/* Axes Helper */}
      <axesHelper args={[4]} />
    </group>
  );
};

const DataCard = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-20 relative">
    <span className="text-slate-800 text-[10px] font-bold tracking-wide uppercase">{label}</span>
    <div className="flex-1 flex items-center justify-center">
      <span className="text-sm font-medium text-slate-900">
        {value.toFixed(label === 'HEADING' ? 0 : 2)}
      </span>
    </div>
    <span className="absolute bottom-2 right-3 text-slate-500 text-[10px]">{unit}</span>
  </div>
);

export default function IMUTelemetry() {
  const [maneuver, setManeuver] = useState<Maneuver>('Idle');
  const [noise, setNoise] = useState(0.05);
  const [telemetry, setTelemetry] = useState<Telemetry>(baseline);

  // Mutable ref for the physics loop — updated at 60fps, flushed to state at ~15fps
  const telemRef = useRef<Telemetry>({ ...baseline });

  useThrottledRAF(
    () => {
      const target = targets[maneuver];
      const lerpFactor = 0.1;
      const curr = telemRef.current;

      const lerpArr = (c: number[], t: number[]) =>
        c.map((v, i) => v + (t[i] - v) * lerpFactor);

      const addNoise = (arr: number[], baseAmount: number) =>
        arr.map(v => v + (Math.random() - 0.5) * baseAmount * (noise / 0.05));

      telemRef.current = {
        acc: addNoise(lerpArr(curr.acc, target.acc), 0.05) as [number, number, number],
        gyro: addNoise(lerpArr(curr.gyro, target.gyro), 1.5) as [number, number, number],
        mag: addNoise(lerpArr(curr.mag, target.mag), 0.02) as [number, number, number],
      };
    },
    () => setTelemetry({ ...telemRef.current }),
    [maneuver, noise]
  );

  const maneuvers: Maneuver[] = ['Idle', 'Hard Braking', 'Sharp Left', 'Sharp Right', 'Wheelie'];

  return (
    <div className="w-full h-full bg-[#f4f7f9] rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-slate-800 text-xl font-medium">IMU Telemetry Explorer</h2>
      </div>

      <div className="bg-white rounded-2xl mx-6 shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
        <div className="h-[300px] w-full relative bg-white border-b border-slate-100">
          <Canvas camera={{ position: [8, 6, 10], fov: 50 }} className="relative z-10">
            <ambientLight intensity={0.7} />
            <directionalLight position={[8, 12, 8]} intensity={1.0} />
            <directionalLight position={[-5, 5, -5]} intensity={0.3} />

            {/* Cartesian ground grid */}
            <Grid
              infiniteGrid
              fadeDistance={30}
              cellSize={1}
              sectionSize={5}
              cellColor="#cbd5e1"
              sectionColor="#94a3b8"
              position={[0, -2, 0]}
            />

            <IMUBlockModel maneuver={maneuver} />

            <OrbitControls
              enableZoom={true}
              makeDefault
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
              autoRotate={false}
            />
          </Canvas>
        </div>

        <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          <DataCard label="ACCEL X" value={telemetry.acc[0]} unit="g" />
          <DataCard label="ACCEL Y" value={telemetry.acc[1]} unit="g" />
          <DataCard label="ACCEL Z" value={telemetry.acc[2]} unit="g" />

          <DataCard label="GYRO ROLL" value={telemetry.gyro[0]} unit="°/s" />
          <DataCard label="GYRO PITCH" value={telemetry.gyro[1]} unit="°/s" />
          <DataCard label="GYRO YAW" value={telemetry.gyro[2]} unit="°/s" />

          <DataCard label="HEADING" value={telemetry.mag[0] > 0 ? 0 : 90} unit="°" />
          <DataCard label="MAG X" value={telemetry.mag[0]} unit="µT" />
          <DataCard label="MAG Y" value={telemetry.mag[1]} unit="µT" />
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-slate-600 text-sm font-medium">Maneuver</span>
          <select
            className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5 outline-none"
            value={maneuver}
            onChange={(e) => setManeuver(e.target.value as Maneuver)}
          >
            {maneuvers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-slate-600 text-sm font-medium whitespace-nowrap">Sensor Noise</span>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={noise}
            onChange={(e) => setNoise(parseFloat(e.target.value))}
            className="w-full sm:w-32"
          />
          <div className="bg-white border border-slate-300 rounded-lg px-3 py-1 min-w-[3rem] text-center">
            <span className="text-sm text-slate-800 font-medium">{noise.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
