import { useState } from "react";
import StatsBar from "../components/StatsBar";
import BioSection from "../components/BioSection";
import SidePanel from "../components/SidePanel";
import DBSMeter from "../components/DBSMeter";

const Dashboard = () => {
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      <DBSMeter score={823} min={300} max={900} />
      <div className="mx-auto max-w-screen-2xl p-6 md:p-12 lg:px-24">
        <StatsBar />
        <div className="bento-grid">
          <BioSection showMore={showMore} />
          <SidePanel showMore={showMore} setShowMore={setShowMore} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
