// type Race = {
//   date: string;
//   name: string;
//   circuit: string;
// };

// const races: Race[] = [
//   {
//     date: "Oct 27",
//     name: "PT Grand Prix of Thailand",
//     circuit: "Chang International Circuit",
//   },
//   {
//     date: "Nov 03",
//     name: "Malaysian Grand Prix",
//     circuit: "Sepang International Circuit",
//   },
//   {
//     date: "Nov 17",
//     name: "Motul Grand Prix of Valencia",
//     circuit: "Circuit Ricardo Tormo",
//   },
// ];
const USER_PROFILE = {
  name: "M. Márquez",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAYyMy_KeyJBrFVjw4sfb8OdogOyW0pkBlGJbtV-Mg3fryjwQc9mBWIG8TRJ7KHMTaxKiZX2otKJtgrYMJXGe4m1xnlxe3dAMXXURmLWb0hKqbl7uK2v4mjzgNAx9yYlaiZmSeVtgG60ZX-Cy12sU9kCIROGzRJNLrND0gNe9sBksz7hV5lSUhN55ilJXEB1SP3sAKFnM06vD1QPj8OeeC5omybzyzLOvGgZ0fHnVk-jM6Ug8Ifj-f7Z3NfYRri6rwvpFS99Tvpu0I",
};

const SidePanel = ({ showMore, setShowMore }: { showMore: boolean; setShowMore: (v: boolean) => void }) => {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      {/* <!-- Race Schedule & Live Telemetry --> */}
      <div className="bg-surface-container-high p-8 rounded-3xl flex-1">
        <h2 className="font-headline text-2xl font-bold uppercase mb-8">
          Driver Details
        </h2>
        <div className="space-y-6">
          <img
            src={USER_PROFILE.avatarUrl}
            alt={USER_PROFILE.name}
            className="w-100 h-100 rounded-full object-cover shadow-lg"
          />
          <span className="font-headline font-bold text-2xl">
            {USER_PROFILE.name}
          </span>
        </div>

        {/* Personal Info */}
        <div className="mt-8 pt-8 border-t border-outline-variant/30">
          <h3 className="font-headline text-lg font-bold uppercase text-primary mb-4">
            Personal Info
          </h3>
          <div className="space-y-3 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
              <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Email</span>
              <span className="font-body text-sm font-medium">driver@example.com</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
              <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Phone</span>
              <span className="font-body text-sm font-medium">+91 98765 43210</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
              <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Age</span>
              <span className="font-body text-sm font-medium">38</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label text-[10px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">License</span>
              <span className="font-body text-sm font-medium">DL14 2018001234</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full mt-8 flex items-center justify-center gap-2 py-4 border border-primary/20 rounded-xl font-headline font-bold uppercase text-primary hover:bg-primary hover:text-white transition-all text-sm group"
        >
          {showMore ? 'View Less' : 'View More'}
          <span className={`material-symbols-outlined transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {showMore && (
          <div className="mt-8 pt-8 border-t border-outline-variant/30 animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">

            {/* Allocated Trucks */}
            <div>
              <h3 className="font-headline text-lg font-bold uppercase text-primary mb-4">
                Active Bike
              </h3>
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
                  <span className="font-headline font-bold text-base text-primary">Harley Davidson 1200</span>
                  <span className="font-label text-[10px] uppercase bg-primary text-on-primary px-3 py-1 rounded-full font-bold tracking-wider">Active</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Device ID</span>
                    <span className="font-body text-xs font-medium">ABC123XYZ</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Veh Number</span>
                    <span className="font-body text-xs font-medium">UP32AB1234</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Weight</span>
                    <span className="font-body text-xs font-medium">3500 KG</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Reg Date</span>
                    <span className="font-body text-xs font-medium">15-Jan-2018</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Insurance</span>
                    <span className="font-body text-xs font-bold text-green-500">Active</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">RTO</span>
                    <span className="font-body text-xs font-medium">Lucknow</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Last Service</span>
                    <span className="font-body text-xs font-medium">20-Oct-2023</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-label text-[9px] uppercase text-on-surface-variant font-bold tracking-widest relative top-px">Mileage</span>
                    <span className="font-body text-xs font-medium">80,000 KM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      {/* <!-- Performance Chip / Quick Card --> */}
      <div className="bg-inverse-surface text-surface p-8 rounded-3xl shadow-xl">
        <span className="font-label text-xs font-bold uppercase text-primary tracking-[0.2em]">
          Live Telemetry
        </span>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-headline text-5xl font-black">109</span>
          <span className="font-label text-sm text-surface/60">KM/H</span>
        </div>
        <p className="font-body text-xs text-surface/50 mt-2 uppercase tracking-widest">
          Top Speed recorded this session
        </p>
        <div className="mt-6 flex gap-2">
          <div className="h-1 flex-1 bg-primary"></div>
          <div className="h-1 flex-1 bg-surface/10"></div>
          <div className="h-1 flex-1 bg-surface/10"></div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
