type NavItem = {
  icon: string;
  label: string;
  active: boolean;
};

const navItems: NavItem[] = [
  { icon: "speed", label: "Home", active: true },
  { icon: "history", label: "Stats", active: false },
  { icon: "calendar_today", label: "Races", active: false },
  { icon: "person", label: "Profile", active: false },
];
const MobileNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg px-8 py-4 flex justify-between items-center z-50 border-t border-red-100">
      {navItems.map((item) => (
        <button
          key={item.label}
          className={`flex flex-col items-center gap-1 ${
            item.active ? "text-primary" : "text-rose-900/40"
          }`}
        >
          <span
            className="material-symbols-outlined"
          >
            {item.icon}
          </span>

          <span className="text-[10px] font-headline font-bold uppercase">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MobileNav;
