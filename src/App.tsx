import Navbar from "./components/Navbar";
import StatsBar from "./components/StatsBar";
import BioSection from "./components/BioSection";
import SidePanel from "./components/SidePanel";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";

function App() {
  return (
    <div className="flex min-h-screen pt-20">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto p-6 md:p-12 lg:px-24">
          <StatsBar />
          <div className="bento-grid">
            <BioSection />
            <SidePanel />
          </div>
          <Footer />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

export default App;
