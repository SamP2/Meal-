import { motion } from 'motion/react';
import { ChevronDown, ToggleRight, Utensils, ArrowRight, Calendar, Star, Clock, Store, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function DashboardScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-surface/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL7sOCIru3oE5qK4XcWlotKkXZQAXF3uWCSGWWQJiVNrCEAHmBGAHN4oGvN2QJ630dZJJW9z7HLHR6H0RAf6BrPCs0QIu3D4vY2xRZr4Pkjkpn09wda5l_eJztwj700E-uLEQsgGjqcIR-zcDQAHKMOO07TxcINA642dabd8nQ6KUJbEJTjLZLvA1VxOeObG1mw6rQnhPAzDnCuNE3_B5tWL1gaLLtEXKPNi46Whd1br-AQ5uCa0dNbLonXKa9brGoawwRPY-nhWWV" 
              alt="Chef" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-headline font-extrabold text-primary text-lg">Mess Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <ToggleRight className="w-8 h-8 text-primary" />
        </div>
      </header>

      <div className="bg-surface-container-low h-2 mt-[72px]"></div>

      <main className="px-6 pt-6 space-y-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl transition-colors hover:bg-surface-container-high">
              <span className="font-headline font-bold text-on-surface">The Green Plate</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</span>
              <div className="flex items-center gap-3 bg-primary-container/30 px-3 py-1.5 rounded-full border border-primary/10">
                <span className="text-xs font-bold text-primary">OPEN</span>
                <div className="w-10 h-5 bg-primary rounded-full relative p-0.5 flex items-center justify-end">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-primary-container rounded-2xl p-6 overflow-hidden editorial-shadow border border-outline-variant">
            <div className="relative z-10 max-w-[60%]">
              <h2 className="text-2xl font-headline font-extrabold text-primary leading-tight">Good Morning, Chef.</h2>
              <p className="text-on-surface-variant text-sm mt-2">124 active subscriptions today. Ready for service?</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Utensils className="w-32 h-32 text-primary" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/manage-menu')}
            className="col-span-2 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant flex justify-between items-center group cursor-pointer editorial-shadow"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-primary" />
                <span className="text-sm font-headline font-bold text-on-surface">Today's Menu</span>
              </div>
              <p className="text-xs text-on-surface-variant">Update breakfast, lunch & dinner items</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col justify-between aspect-square cursor-pointer active:scale-95 transition-transform editorial-shadow border border-outline-variant">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shadow-sm mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-headline font-bold text-on-surface">Weekly Menu</h3>
              <p className="text-[10px] text-on-surface-variant mt-1">Plan for the week ahead</p>
            </div>
          </div>

          <div className="bg-secondary-container p-5 rounded-2xl flex flex-col justify-between cursor-pointer active:scale-95 transition-transform editorial-shadow border border-secondary/20">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-on-secondary-container shadow-sm mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-headline font-bold text-on-secondary-container">Reviews</h3>
              <div className="flex items-center gap-1 mt-1 text-on-secondary-container/80">
                <span className="text-xs font-bold">4.8</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
            <div className="text-[10px] text-on-secondary-container/60 mt-4 italic">"The dal tadka was amazing..."</div>
          </div>

          <div className="space-y-4 flex flex-col">
            <div className="flex-1 bg-surface-container-low p-5 rounded-xl flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-headline font-bold text-on-surface">Operating Hours</h3>
              </div>
            </div>
            <div 
              onClick={() => navigate('/profile-setup')}
              className="flex-1 bg-surface-container-low p-5 rounded-xl flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                <Store className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-headline font-bold text-on-surface">Mess Profile</h3>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
