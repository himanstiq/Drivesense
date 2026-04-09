const NAV_LINKS = ["Dashboard", "Simulations", "Product", "About Us"];

const USER_PROFILE = {
  name: "M. Márquez",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAYyMy_KeyJBrFVjw4sfb8OdogOyW0pkBlGJbtV-Mg3fryjwQc9mBWIG8TRJ7KHMTaxKiZX2otKJtgrYMJXGe4m1xnlxe3dAMXXURmLWb0hKqbl7uK2v4mjzgNAx9yYlaiZmSeVtgG60ZX-Cy12sU9kCIROGzRJNLrND0gNe9sBksz7hV5lSUhN55ilJXEB1SP3sAKFnM06vD1QPj8OeeC5omybzyzLOvGgZ0fHnVk-jM6Ug8Ifj-f7Z3NfYRri6rwvpFS99Tvpu0I",
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between bg-white/70 px-8 py-4 backdrop-blur-xl md:px-12">
      <span className="font-headline text-2xl font-black italic tracking-tighter text-red-800">
        Drivesense
      </span>

      <div className="ml-8 hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            {link}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          className="text-red-700 transition-transform active:scale-90"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-tr from-primary to-primary-container p-0.5">
            <img
              src={USER_PROFILE.avatarUrl}
              alt={`${USER_PROFILE.name} Profile`}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <span className="hidden font-headline text-xs font-bold uppercase text-red-800 sm:block">
            {USER_PROFILE.name}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
