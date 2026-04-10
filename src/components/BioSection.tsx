import Map, { Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
// @ts-ignore - TS doesn't know about .glb modules by default without a declaration file
import bikeUrl from '../assets/bike.glb';

function BikeModel() {
  const { scene } = useGLTF(bikeUrl);
  return <primitive object={scene} />;
}

const BioSection = ({ showMore }: { showMore: boolean }) => {
  return (
    <>
      {/* <!-- Bento Content Section --> */}
      <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-12 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-1 bg-primary"></div>
          <h2 className="font-headline text-3xl font-bold uppercase">
            GPS View
          </h2>
        </div>
        <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-inner">
          <Map
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || ""}
            initialViewState={{
              longitude: 76.7525,
              latitude: 30.7250,
              zoom: 12.5
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/standard"
          >
            <Source id="route-source" type="geojson" data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [76.787045, 30.74008], [76.787391, 30.739674], [76.78848, 30.740205],
                  [76.784407, 30.73767], [76.784371, 30.737142], [76.784857, 30.736583],
                  [76.780299, 30.73376], [76.779881, 30.733163], [76.779181, 30.733011],
                  [76.769042, 30.726681], [76.768672, 30.726016], [76.767219, 30.725566],
                  [76.757567, 30.719477], [76.757399, 30.719098], [76.756855, 30.719023],
                  [76.751913, 30.716048], [76.746628, 30.712656], [76.746131, 30.711915],
                  [76.745535, 30.711979], [76.745212, 30.713007], [76.740325, 30.718641],
                  [76.738229, 30.717732], [76.736421, 30.718054], [76.734972, 30.71782],
                  [76.731428, 30.713194], [76.723692, 30.708314], [76.722386, 30.70988],
                  [76.720897, 30.708939], [76.719988, 30.709992]
                ]
              }
            }}>
              <Layer
                id="route-layer"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#3b82f6', 'line-width': 6 }}
              />
            </Source>
          </Map>
        </div>
        {/* <!-- 3D Biker View --> */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-1 bg-primary"></div>
            <h2 className="font-headline text-3xl font-bold uppercase">
              3D Motorcycle Telemetry
            </h2>
          </div>
          <div className="w-full h-[500px] bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/30 flex items-center justify-center relative shadow-inner">
            <Suspense fallback={<div className="font-headline animate-pulse text-on-surface-variant font-bold">Loading 3D Model...</div>}>
              <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
                <Stage environment="city" intensity={0.6}>
                  <BikeModel />
                </Stage>
                <OrbitControls autoRotate enableZoom={true} maxPolarAngle={Math.PI / 2 + 0.1} />
              </Canvas>
            </Suspense>
          </div>
        </div>

        {/* Harley-Davidson Info — visible when View More is expanded */}
        {showMore && (
          <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-1 bg-primary"></div>
              <h2 className="font-headline text-3xl font-bold uppercase">
                About The Bike
              </h2>
            </div>
            <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 space-y-4">
              <h3 className="font-headline text-xl font-bold text-primary uppercase tracking-wide">Harley-Davidson Street 750</h3>
              <p className="font-body text-on-surface leading-relaxed">
                The Harley-Davidson Street 750 is a liquid-cooled, 749cc Revolution X™ V-Twin cruiser designed for
                urban agility without compromising the raw Harley-Davidson experience. With a low seat height of
                25.7 inches and a tight 59.5° rake angle, this bike is engineered for responsive handling through
                dense city traffic and tight corners—making it the perfect candidate for our DriveSense telemetry system.
              </p>
              <p className="font-body text-on-surface leading-relaxed">
                Weighing in at 233 kg (514 lbs) with a fuel capacity of 13.1 liters, the Street 750 provides a
                balanced center of gravity ideal for our IMU-based lean-angle and roll-axis measurements. The
                low-end torque delivery of the Revolution X engine creates distinct accelerometer signatures during
                aggressive throttle events, allowing our Edge AI to differentiate between intentional acceleration
                and erratic riding behavior with high fidelity.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="font-label text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Engine</span>
                  <span className="font-body text-sm font-medium mt-1">749cc V-Twin</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Power</span>
                  <span className="font-body text-sm font-medium mt-1">53 HP</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Torque</span>
                  <span className="font-body text-sm font-medium mt-1">59 Nm</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Weight</span>
                  <span className="font-body text-sm font-medium mt-1">233 kg</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BioSection;
