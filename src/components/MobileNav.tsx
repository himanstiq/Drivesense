import { NavLink } from "react-router-dom";

type NavItem = {
  icon: string;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: "speed", label: "Home", path: "/" },
  { icon: "history", label: "Stats", path: "/stats" },
  { icon: "calendar_today", label: "Races", path: "/races" },
  { icon: "person", label: "Profile", path: "/profile" },
];
const MobileNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg px-8 py-4 flex justify-between items-center z-50 border-t border-red-100">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? "text-primary" : "text-rose-900/40"
            }`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>

          <span className="text-[10px] font-headline font-bold uppercase">
            {item.label}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default MobileNav;
