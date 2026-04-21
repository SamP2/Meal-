import { motion } from 'motion/react';
import { ArrowLeft, Search, Trash2, Plus, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MENU } from '../constants';

export default function ManageMenuScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="flex items-center justify-between px-4 h-16 w-full fixed top-0 bg-white/70 backdrop-blur-xl z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="active:scale-95 duration-200 hover:bg-primary-container/20 rounded-full p-2"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-primary">Manage Menu</h1>
        </div>
        <button className="active:scale-95 duration-200 hover:bg-primary-container/20 rounded-full p-2">
          <Search className="w-6 h-6 text-on-surface-variant" />
        </button>
      </header>

      <main className="pt-20 pb-32 px-4 max-w-2xl mx-auto">
        <div className="mb-8 pl-1">
          <p className="text-on-surface-variant text-sm font-semibold tracking-wider uppercase mb-1">Live Inventory</p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Current Menu</h2>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">6 ITEMS ACTIVE</span>
            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold">VEG FOCUS</span>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_MENU.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex items-center gap-4 p-3 bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant transition-all hover:bg-white active:scale-[0.98]"
            >
              <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-on-surface text-base">{item.name}</h3>
                <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
              </div>
              <button className="p-2 text-error hover:bg-error/10 rounded-full transition-colors active:scale-90">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-secondary-container/30 rounded-2xl border-l-4 border-secondary">
          <h4 className="font-bold text-on-secondary-container flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Chef's Tip
          </h4>
          <p className="mt-2 text-sm text-on-secondary-container/80 leading-relaxed">
            Add high-quality photos to increase order volume by up to 30%. Fresh ingredients look best in natural lighting.
          </p>
        </div>
      </main>

      <button className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform duration-200 z-[60]">
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
