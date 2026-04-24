import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ListingFormData } from '../../../lib/validations/listingSchema';

interface CarFormFieldsProps {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
}

export const CarFormFields = ({ register, errors }: CarFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-foreground mb-2">
          Detalji Automobila
        </h2>
        <p className="text-sm text-muted-foreground">
          Unesite osnovne informacije o vozilu
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Make */}
        <div>
          <label htmlFor="make" className="block text-sm font-bold text-foreground mb-2">
            Marka *
          </label>
          <input
            id="make"
            type="text"
            {...register('attributes.make')}
            placeholder="npr. BMW, Mercedes, Audi"
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          />
          {errors.attributes?.make && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.make.message}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-bold text-foreground mb-2">
            Model *
          </label>
          <input
            id="model"
            type="text"
            {...register('attributes.model')}
            placeholder="npr. M3, E-Class, A4"
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          />
          {errors.attributes?.model && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.model.message}</p>
          )}
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-bold text-foreground mb-2">
            Godište *
          </label>
          <input
            id="year"
            type="number"
            {...register('attributes.year', { valueAsNumber: true })}
            placeholder="2020"
            min="1900"
            max="2027"
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          />
          {errors.attributes?.year && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.year.message}</p>
          )}
        </div>

        {/* Mileage */}
        <div>
          <label htmlFor="mileage" className="block text-sm font-bold text-foreground mb-2">
            Kilometraža *
          </label>
          <input
            id="mileage"
            type="number"
            {...register('attributes.mileage', { valueAsNumber: true })}
            placeholder="50000"
            min="0"
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          />
          {errors.attributes?.mileage && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.mileage.message}</p>
          )}
        </div>

        {/* Fuel Type */}
        <div>
          <label htmlFor="fuelType" className="block text-sm font-bold text-foreground mb-2">
            Tip Goriva *
          </label>
          <select
            id="fuelType"
            {...register('attributes.fuelType')}
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          >
            <option value="">Odaberi...</option>
            <option value="Petrol">Benzin</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Električni</option>
            <option value="Hybrid">Hibrid</option>
          </select>
          {errors.attributes?.fuelType && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.fuelType.message}</p>
          )}
        </div>

        {/* Transmission */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-bold text-foreground mb-2">
            Mjenjač *
          </label>
          <select
            id="transmission"
            {...register('attributes.transmission')}
            className="w-full h-12 px-4 bg-card border border-border/50 rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 outline-none"
          >
            <option value="">Odaberi...</option>
            <option value="Manual">Ručni</option>
            <option value="Automatic">Automatik</option>
          </select>
          {errors.attributes?.transmission && (
            <p className="text-red-500 text-sm mt-1">{errors.attributes.transmission.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
