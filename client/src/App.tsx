import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ConsentBanner } from './components/analytics/ConsentBanner';
import { initializeAnalytics } from './lib/analytics';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ListingFeed } from './components/listings/ListingFeed';
import { ListingWizard } from './components/listings/ListingWizard';
import { CreateListingWizard } from './components/listings/CreateListingWizard';
import { ListingDetail } from './components/listings/ListingDetail';
import { MobileUpload } from './pages/MobileUpload';
import { Settings } from './pages/Settings';
import { UserProfile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { Kontakt } from './pages/Kontakt';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Pricing } from './pages/Pricing';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DealerProfile } from './pages/DealerProfile';
import { NotFound } from './pages/NotFound';

function App() {
  useEffect(() => {
    initializeAnalytics({
      ga4MeasurementId: import.meta.env.VITE_GA4_MEASUREMENT_ID || '',
      metaPixelId: import.meta.env.VITE_META_PIXEL_ID || '',
    });
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <NuqsAdapter>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />

            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/predaj-oglas" element={<ListingWizard />} />
                <Route path="/create-listing" element={<CreateListingWizard />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/mobile-upload" element={<MobileUpload />} />
                <Route path="/postavke" element={<Settings />} />
                <Route path="/profil" element={<UserProfile />} />
                <Route path="/favoriti" element={<Favorites />} />
                <Route path="/kontakt" element={<Kontakt />} />
                <Route path="/privatnost" element={<Privacy />} />
                <Route path="/uvjeti-koristenja" element={<Terms />} />
                <Route path="/za-partnere" element={<Pricing />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/saloni/:dealerSlug" element={<DealerProfile />} />
                {/* /pretraga — general search with nuqs URL state */}
                <Route path="/pretraga" element={<ListingFeed />} />
                <Route path="/:categorySlug" element={<ListingFeed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* GDPR Consent Banner */}
            <ConsentBanner />
          </div>
        </NuqsAdapter>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;