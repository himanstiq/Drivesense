type Stat = {
  value: string;
  label: string;
};
const stats: Stat[] = [
  { value: "8", label: "Harsh Braking & Acceleration" },
  { value: "85", label: "Sharp Cornering" },
  { value: "140", label: "Rollover Signatures" },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 relative z-30">
      {stats.map((stat) => (
        <div
          key={stat.value}
          className="bg-white p-10 rounded-2xl flex flex-col items-center justify-center text-center border border-outline-variant/30"
        >
          <span className="font-headline text-7xl font-black text-primary mb-2">
            {stat.value}
          </span>
          <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
