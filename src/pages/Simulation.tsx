import IMUTelemetry from '../components/IMUTelemetry';
import AdaptiveTelemetry from '../components/AdaptiveTelemetry';
import DriverBehaviourScore from '../components/DriverBehaviourScore';
import IMUSimulator from '../components/IMUSimulator';
import EventEngine from '../components/EventEngine';
import EdgeAISimulator from '../components/EdgeAISimulator';
import WeavingSimulator from '../components/WeavingSimulator';
import TunnelSimulator from '../components/TunnelSimulator';

export default function Simulation() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pt-10 pb-20 mt-10">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-1 bg-primary"></div>
                        <h1 className="font-headline text-3xl font-bold uppercase text-on-background">Driving Simulators</h1>
                    </div>
                    <p className="font-body text-on-surface-variant">Interactive modules exploring the sensor logic of our behavior score system.</p>
                </div>

                {/* Dynamic Grid Layout for Simulations */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Component 1: IMU Telemetry Explorer */}
                    <div className="flex">
                        <IMUTelemetry />
                    </div>

                    {/* Component 2: Adaptive Telemetry Engine */}
                    <div className="flex">
                        <AdaptiveTelemetry />
                    </div>

                    {/* Component 3: Driver Behaviour Score */}
                    <div className="flex xl:col-span-1">
                        <DriverBehaviourScore />
                    </div>

                    {/* Component 4: 6-Axis IMU Simulator */}
                    <div className="flex xl:col-span-1">
                        <IMUSimulator />
                    </div>

                    {/* Component 5: ESP32 Event Engine */}
                    <div className="flex xl:col-span-1">
                        <EventEngine />
                    </div>
                    {/* Component 5: ESP32 Event Engine */}
                    <div className="flex xl:col-span-1">
                        <EdgeAISimulator />
                    </div>
                    {/* Component 6: Weaving Simulator */}
                    <div className="flex xl:col-span-1">
                        <WeavingSimulator />
                    </div>
                    {/* Component 7: Tunnel Simulator */}
                    <div className="flex xl:col-span-1">
                        <TunnelSimulator />
                    </div>

                </div>

            </div>
        </div>
    );
}
