import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ListingFeed } from './components/listings/ListingFeed';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<ListingFeed />} />
            <Route path="/:categorySlug" element={<ListingFeed />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;