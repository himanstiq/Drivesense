type Milestone = {
  year: string;
  title: string;
  description: string;
};

const milestones: Milestone[] = [
  {
    year: "2013",
    title: "MotoGP Debut & Youngest Champion",
    description: "Rewrote history...",
  },
  {
    year: "2014",
    title: "Total Domination",
    description: "Recorded 13 wins...",
  },
  {
    year: "2024",
    title: "The Resurrection",
    description: "Legendary comebacks...",
  },
];

const BioSection = () => {
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
        <div className="space-y-6">
          <p className="font-body text-xl leading-relaxed text-on-surface/80">
            Known for his aggressive riding style and uncanny ability to save
            crashes that seem impossible, Marc Márquez changed the sport forever
            when he entered MotoGP in 2013. His nickname, "The Ant," represents
            the spirit of a tiny creature that can carry many times its own
            weight—reflecting Marc's immense strength and resilience.
          </p>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed">
            Marc's career is defined by boundary-pushing physics. Whether it's
            dragging his elbows or shoulders at extreme lean angles or
            recovering from career-threatening injuries, he remains the ultimate
            competitor. After a decade of dominance with Honda, his transition
            to Gresini Racing marks a bold new chapter in a legendary story.
          </p>
        </div>
        {/* <!-- Highlights Timeline --> */}
        <div className="mt-16 space-y-8">
          <h3 className="font-headline text-xl font-bold uppercase text-primary">
            Career Milestones
          </h3>
          <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-outline-variant">
            {milestones.map((milestone) => (
              <div key={milestone.year} className="relative">
                <div className="absolute -left-[35px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface"></div>
                <span className="font-headline font-black text-2xl text-primary">
                  {milestone.year}
                </span>
                <h4 className="font-headline font-bold text-lg mt-1">
                  {milestone.title}
                </h4>
                <p className="font-body text-on-surface-variant mt-2">
                  {milestone.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BioSection;
