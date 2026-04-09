const footerLinks = ["Privacy Policy", "Terms & Conditions", "Press release"];
const Footer = () => {
  return (
    <footer className="mt-24 pt-12 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-8 mb-24 md:mb-12">
      <div className="flex flex-col gap-2">
        <span className="text-3xl font-black italic text-red-800 dark:text-red-100 font-headline tracking-tighter">
          Drivesense
        </span>
        <p className="font-body text-xs text-on-surface-variant uppercase tracking-widest">
          Techno Tuners • © 2026 yantrikaran privated Limited
        </p>
      </div>
      <div className="flex gap-8">
        {footerLinks.map((link) => (
          <a
            key={link}
            className="font-headline text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
            href="#"
          >
            {link}
          </a>
        ))}
      </div>
      <div className="flex gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all">
          <span className="material-symbols-outlined">share</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white transition-all">
          <span className="material-symbols-outlined">mail</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
