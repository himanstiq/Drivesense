import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileNav from "./components/MobileNav";

import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-full min-h-[50vh] items-center justify-center">
    <h1 className="font-headline text-4xl font-bold text-red-800">{title}</h1>
  </div>
);

function App() {
  return (
    <div className="flex min-h-screen pt-20">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulations" element={<Simulation />} />
          <Route path="/product" element={<Placeholder title="Product" />} />
          <Route path="/about" element={<Placeholder title="About Us" />} />
          <Route path="/stats" element={<Placeholder title="Stats" />} />
          <Route path="/races" element={<Placeholder title="Races" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Routes>
        <div className="mx-auto max-w-screen-2xl">
          <Footer />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

export default App;
