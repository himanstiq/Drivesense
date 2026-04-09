type Race = {
  date: string;
  name: string;
  circuit: string;
};

const races: Race[] = [
  {
    date: "Oct 27",
    name: "PT Grand Prix of Thailand",
    circuit: "Chang International Circuit",
  },
  {
    date: "Nov 03",
    name: "Malaysian Grand Prix",
    circuit: "Sepang International Circuit",
  },
  {
    date: "Nov 17",
    name: "Motul Grand Prix of Valencia",
    circuit: "Circuit Ricardo Tormo",
  },
];

const SidePanel = () => {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
      {/* <!-- Race Schedule & Live Telemetry --> */}
      <div className="bg-surface-container-high p-8 rounded-3xl flex-1">
        <h2 className="font-headline text-2xl font-bold uppercase mb-8">
          Driver Details
        </h2>
        <div className="space-y-6">
          {races.map((race) => (
            <div
              key={race.name}
              className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl"
            >
              <div>
                <span className="font-label text-[10px] font-bold text-primary uppercase tracking-widest">
                  {race.date}
                </span>
                <h4 className="font-headline font-bold">{race.name}</h4>
                <p className="font-body text-xs text-on-surface-variant">
                  {race.circuit}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary">
                chevron_right
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-4 border border-primary/20 rounded-xl font-headline font-bold uppercase text-primary hover:bg-primary hover:text-white transition-all text-sm">
          Full Season Schedule
        </button>
      </div>
      {/* <!-- Performance Chip / Quick Card --> */}
      <div className="bg-inverse-surface text-surface p-8 rounded-3xl shadow-xl">
        <span className="font-label text-xs font-bold uppercase text-primary tracking-[0.2em]">
          Live Telemetry
        </span>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-headline text-5xl font-black">352</span>
          <span className="font-label text-sm text-surface/60">KM/H</span>
        </div>
        <p className="font-body text-xs text-surface/50 mt-2 uppercase tracking-widest">
          Top Speed recorded this season
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
