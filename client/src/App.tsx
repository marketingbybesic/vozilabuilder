import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Home } from './pages/Home';
import { ListingFeed } from './components/listings/ListingFeed';
import { ListingWizard } from './components/listings/ListingWizard';
import { CreateListing } from './components/listings/CreateListing';
import { ListingDetail } from './components/listings/ListingDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predaj-oglas" element={<ListingWizard />} />
            <Route path="/kreiraj-oglas" element={<CreateListing />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/:categorySlug" element={<ListingFeed />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;