import { motion } from 'motion/react';
import { ArrowLeft, Edit, MapPin, LocateFixed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function ProfileSetupScreen() {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState('$$');

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="bg-white/70 backdrop-blur-xl fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-primary active:scale-95 duration-200 hover:bg-primary-container/20 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-primary">Profile Setup</h1>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <section className="mb-10">
          <div className="relative group">
            <div className="w-full h-64 rounded-xl overflow-hidden bg-surface-container-low">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4RmergLwD15brXTqwRqY4C_LRefvx_2zNAn3pZamML120X1XGPTjFFdTbYU7kmXq88y7K6zgEopv8obmrW0JiLg6Mfy8OXOM4T1mQI-uBX4SvoivkA6DZ67MChtFJQ84XRCF59-BV5BV-DrllIqoEG_VS26VXODGhZ7OWBtDlirxi7rXsSM6Pgj8Mif67RLboaBy4ytdpIYRkU2Ke3bjAsusTZk4fAS9s94yDd98ZY-_WiFzF08dr6UbmMN0hNhVVAOiHK_sDqYIe" 
                alt="Cover" 
                className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            <button className="absolute bottom-4 right-4 bg-surface-container-lowest text-primary shadow-lg px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm active:scale-95 transition-all">
              <Edit className="w-4 h-4" />
              Edit Photo
            </button>
          </div>
          <p className="mt-4 text-on-surface-variant text-sm font-medium">Add a cover photo that captures the essence of your cooking space.</p>
        </section>

        <form className="space-y-8">
          <div className="space-y-2">
            <label className="font-headline font-bold text-sm tracking-wide text-on-surface pl-1">Mess Name</label>
            <input 
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all" 
              placeholder="e.g., The Verdant Hearth" 
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="font-headline font-bold text-sm tracking-wide text-on-surface pl-1">Location</label>
            <div className="relative flex items-center">
              <input 
                className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 pl-12 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all" 
                placeholder="Enter your street or district" 
                type="text"
              />
              <MapPin className="absolute left-4 w-5 h-5 text-outline" />
              <button type="button" className="absolute right-4 text-primary font-bold text-sm hover:bg-primary-container/30 p-2 rounded-lg transition-colors">
                <LocateFixed className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-headline font-bold text-sm tracking-wide text-on-surface pl-1">Price Range</label>
            <div className="flex gap-3">
              {['$', '$$', '$$$'].map(range => (
                <button 
                  key={range}
                  type="button"
                  onClick={() => setPriceRange(range)}
                  className={cn(
                    "px-6 py-3 rounded-full font-bold text-sm transition-all",
                    priceRange === range ? "bg-primary-container text-on-primary-container shadow-sm" : "bg-surface-container-highest text-on-surface-variant hover:bg-primary-container/20"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-headline font-bold text-sm tracking-wide text-on-surface pl-1">Description</label>
            <textarea 
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all resize-none" 
              placeholder="Tell potential guests about your signature dishes and the atmosphere..." 
              rows={4}
            />
          </div>

          <div className="bg-surface-container-lowest editorial-shadow border border-outline-variant p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-headline font-bold text-sm">Typical Availability</span>
              <span className="text-xs font-bold text-primary">High Freshness</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">This gauge helps users understand your typical meal rotation and ingredient freshness cycles.</p>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-2xl px-6 pb-8 pt-4 flex justify-center items-center z-50">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full max-w-md bg-primary text-on-primary py-4 rounded-2xl font-headline font-extrabold text-lg tracking-tight shadow-lg active:scale-[0.98] transition-all"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}
