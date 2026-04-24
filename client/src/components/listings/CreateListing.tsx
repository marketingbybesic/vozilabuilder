import { Plus } from 'lucide-react';

export const CreateListing = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Plus className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
          Kreiraj Oglas
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Ova stranica je u izradi. Uskoro ćete moći kreirati oglase direktno ovdje.
        </p>
        
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-lg">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-bold">Savjet:</span> Za sada koristite ListingWizard komponentu na <code className="px-2 py-1 bg-accent rounded">/predaj-oglas</code> ruti.
          </p>
        </div>
      </div>
    </div>
  );
};
