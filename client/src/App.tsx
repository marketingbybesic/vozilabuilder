import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Main content will be rendered here via routing */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Dobrodošli na Vozila.hr</h1>
          <p className="text-muted-foreground">
            Platforma za kupnju i prodaju vozila uskoro dostupna.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
