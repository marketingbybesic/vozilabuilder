import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { listingSchema, ListingFormData } from '../../lib/validations/listingSchema';
import { navigationMenu } from '../../config/taxonomy';
import { CarFormFields } from './forms/CarFormFields';

export const ListingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      price: 0,
      currency: '€',
      categoryId: '',
      status: 'draft' as 'draft',
      attributes: {},
    },
  });

  const selectedCategoryId = watch('categoryId');

  const handleCategorySelect = (categorySlug: string) => {
    setValue('categoryId', categorySlug);
    setCurrentStep(2);
  };

  const onSubmit = (data: ListingFormData) => {
    console.log('Form submitted:', data);
    // Will implement Supabase submission in next phase
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Predaj Oglas
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Prodaj svoje vozilo brzo i jednostavno
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-500 ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'
          }`}>
            {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
          </div>
          <div className={`h-1 w-16 transition-all duration-500 ${
            currentStep >= 2 ? 'bg-primary' : 'bg-accent'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-500 ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'
          }`}>
            2
          </div>
          <div className={`h-1 w-16 transition-all duration-500 ${
            currentStep >= 3 ? 'bg-primary' : 'bg-accent'
          }`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-500 ${
            currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'
          }`}>
            3
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 1: Category Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Odaberi Kategoriju
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Što prodaješ?
                  </p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {navigationMenu.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategoryId === category.slug;

                    return (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => handleCategorySelect(category.slug)}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-4 ring-primary/20'
                            : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-accent/50'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`flex justify-center mb-4 transition-colors duration-300 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                        }`}>
                          {Icon && <Icon className="h-10 w-10" strokeWidth={2.5} />}
                        </div>

                        {/* Label */}
                        <p className={`text-sm font-black uppercase tracking-wider text-center transition-colors duration-300 ${
                          isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                        }`}>
                          {category.name}
                        </p>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                          </div>
                        )}

                        {/* Hover Arrow */}
                        <div className={`absolute bottom-2 right-2 transition-all duration-300 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <ChevronRight className="h-5 w-5 text-primary" strokeWidth={2.5} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Error Message */}
                {errors.categoryId && (
                  <p className="text-sm text-destructive font-medium text-center mt-4">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            )}

            {/* STEP 2: Category-Specific Form Fields */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Render category-specific form */}
                {selectedCategoryId === 'osobni-automobili' && (
                  <CarFormFields register={register} errors={errors} />
                )}

                {/* If category not yet implemented */}
                {selectedCategoryId && selectedCategoryId !== 'osobni-automobili' && (
                  <div className="p-12 bg-accent/30 border-2 border-dashed border-border/50 rounded-xl text-center">
                    <p className="text-lg font-medium text-muted-foreground">
                      Form fields for <span className="font-bold text-primary">{selectedCategoryId}</span> coming soon...
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-accent/80 transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Natrag
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Nastavi
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Trebaš pomoć? <a href="#" className="text-primary font-bold hover:underline">Kontaktiraj podršku</a>
          </p>
        </div>
      </div>
    </div>
  );
};
