import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Star, Clock, Navigation, StarHalf } from 'lucide-react';
import { MOCK_MESSES, MOCK_MENU } from '../constants';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function MessDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mess = MOCK_MESSES.find(m => m.id === id) || MOCK_MESSES[0];
  const [activeTab, setActiveTab] = useState('Today’s Menu');

  const tabs = ['Today’s Menu', 'Weekly Menu', 'Reviews'];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="active:scale-95 duration-150 ease-in-out hover:bg-primary-container/20 p-2 rounded-full"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">Mess Details</h1>
        </div>
        <button className="active:scale-95 duration-150 ease-in-out hover:bg-primary-container/20 p-2 rounded-full">
          <Share2 className="w-6 h-6 text-primary" />
        </button>
      </nav>

      <main className="pb-32">
        <header className="relative h-[397px] w-full overflow-hidden">
          <img 
            src={mess.image} 
            alt={mess.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                mess.isOpen ? "bg-primary text-on-primary" : "bg-error text-on-error"
              )}>
                {mess.isOpen ? 'Open Now' : 'Closed'}
              </span>
              <div className="flex items-center bg-secondary-container/90 backdrop-blur-md px-2 py-1 rounded-lg gap-1">
                <Star className="w-3 h-3 text-on-secondary-container fill-current" />
                <span className="text-xs font-bold text-on-secondary-container">{mess.rating}</span>
              </div>
            </div>
            <h2 className="font-headline font-extrabold text-4xl text-white tracking-tighter leading-none mb-2">{mess.name}</h2>
            <p className="text-white/80 text-sm font-medium">{mess.description}</p>
          </div>
        </header>

        <section className="px-6 -mt-4 relative z-10">
          <div className="bg-surface-container-lowest editorial-shadow rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border border-outline-variant">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Distance</span>
                <div className="flex items-center gap-1">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="font-bold text-on-surface">{mess.distance}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Hours</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-bold text-on-surface">{mess.hours}</span>
                </div>
              </div>
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform shadow-lg">
              <Navigation className="w-4 h-4" />
              Get Directions
            </button>
          </div>
        </section>

        <section className="mt-8 px-6">
          <div className="flex gap-8 border-b border-outline-variant/10">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-2 border-b-2 font-bold text-sm tracking-tight transition-all",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 px-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {activeTab === 'Today’s Menu' && MOCK_MENU.map((item) => (
                <div key={item.id} className="group bg-surface-container-lowest hover:bg-surface-container-low transition-colors p-4 rounded-2xl flex items-center justify-between editorial-shadow border border-outline-variant">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <span className="font-headline font-extrabold text-primary text-lg">${item.price}</span>
                </div>
              ))}
              
              {activeTab === 'Reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-primary-container/20 p-6 rounded-2xl">
                    <div>
                      <h3 className="text-4xl font-headline font-extrabold text-primary">{mess.rating}</h3>
                      <div className="flex gap-1 text-secondary mt-1">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <StarHalf className="w-4 h-4 fill-current" />
                      </div>
                      <p className="text-xs font-bold text-on-surface-variant mt-2 uppercase tracking-widest">Based on 124 reviews</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/review/${mess.id}`)}
                      className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm"
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md px-6 pb-8 pt-4 flex gap-4 items-center shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <button 
          onClick={() => navigate(`/review/${mess.id}`)}
          className="flex-1 border-2 border-primary/20 hover:bg-primary/5 text-primary font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Star className="w-5 h-5" />
          Rate
        </button>
      </div>
    </div>
  );
}
