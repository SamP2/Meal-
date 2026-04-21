import { motion } from 'motion/react';
import { Search, MapPin, Star, Verified, Navigation, Utensils, Map as MapIcon } from 'lucide-react';
import { MOCK_MESSES } from '../constants';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const FILTERS = ['Nearby', 'Top Rated', 'Pure Veg', 'Non-Veg', 'Budget'];

export default function DiscoverScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Location</span>
            <span className="font-headline text-sm font-bold text-primary tracking-tight">Downtown, San Francisco</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-container">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX0Ec9RqA2ufST0L0zlCo_rdlDH5xbLo-uct-4diS_cUPjRvs2l2-Ij28vxH3-EFKBHEkxyjvx5jLL2K0B_c1lz-vn1zqNPlxw-lKbqcc-0toZycc5lj_HnVr4BP8n38g1W5OTw7oAQ1-MDjCeeJkXcob9bVyhS_nt7pobP-IYUOan4ewNa1HHoOMGhobwjrHzPj3BbS_7ab3rjZY6miuwx-1mqYAyQWRM4HM7mWtiSRGr2amVV0KDphjeqrPse8cOOnRYHjSuLolR" 
            alt="Avatar" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main className="pt-20 px-6">
        <section className="mt-4 space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-on-surface-variant" />
            </div>
            <input 
              className="w-full h-14 bg-surface-container-high rounded-full pl-12 pr-6 border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant font-medium transition-all" 
              placeholder="Find home-style freshness..." 
              type="text"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
            {FILTERS.map((filter, i) => (
              <button 
                key={filter}
                className={cn(
                  "flex-shrink-0 px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2",
                  i === 0 ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container-highest text-on-surface hover:bg-surface-container-high"
                )}
              >
                {i === 0 && <Star className="w-4 h-4 fill-current" />}
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-10 space-y-8">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tight">Curated Freshness</h2>
            <span className="text-primary font-bold text-sm cursor-pointer">View All</span>
          </div>

          {MOCK_MESSES.map((mess) => (
            <motion.div 
              key={mess.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => navigate(`/mess/${mess.id}`)}
              className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden transition-all active:scale-[0.98] cursor-pointer editorial-shadow border border-outline-variant"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  src={mess.image} 
                  alt={mess.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-secondary fill-current" />
                  <span className="text-xs font-bold text-on-surface">{mess.rating}</span>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className={cn(
                    "text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm",
                    mess.isOpen ? "bg-primary/90" : "bg-error/90"
                  )}>
                    {mess.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                  {mess.isVerified && (
                    <span className="bg-surface/90 text-on-surface text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                      <Verified className="w-3 h-3 text-primary fill-current" />
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline text-xl font-bold text-on-surface">{mess.name}</h3>
                  <span className="text-on-surface-variant font-medium text-sm">{mess.priceRange}</span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    {mess.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Utensils className="w-4 h-4" />
                    {mess.cuisine}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      <button className="fixed right-6 bottom-32 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform z-40">
        <MapIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
