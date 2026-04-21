import { motion } from 'motion/react';
import { Menu, Settings, Utensils, BookOpen, Tag, Star, ArrowRight, Leaf } from 'lucide-react';
import { cn } from '../lib/utils';

const UPDATES = [
  {
    id: '1',
    title: 'The Hearthstone Organic',
    time: '2 mins ago',
    desc: 'The Hearthstone Organic just opened for lunch. Grab your table before the rush!',
    icon: <Utensils className="w-6 h-6 text-on-primary-container" />,
    color: 'bg-primary-container'
  },
  {
    id: '2',
    title: 'Urban Spice Kitchen',
    time: '1 hour ago',
    desc: "Updated their Today's Menu with fresh seasonal harvests.",
    icon: <BookOpen className="w-6 h-6 text-on-secondary-container" />,
    color: 'bg-secondary-container'
  },
  {
    id: '3',
    title: 'Harbor View Delights',
    time: '3 hours ago',
    desc: 'Check out the new weekly special: Pan-seared sea bass with citrus reduction.',
    icon: <Tag className="w-6 h-6 text-on-tertiary-container" />,
    color: 'bg-tertiary-container'
  }
];

export default function UpdatesScreen() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-primary cursor-pointer" />
          <h1 className="font-headline font-bold text-lg tracking-tight text-primary">Updates</h1>
        </div>
        <Settings className="w-6 h-6 text-primary cursor-pointer" />
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto">
        <div className="mb-8 mt-4">
          <p className="text-on-surface-variant font-body text-sm uppercase tracking-widest mb-1">Your Feed</p>
          <h2 className="font-headline font-extrabold text-3xl text-on-background tracking-tight">What's Fresh</h2>
        </div>

        <div className="space-y-4">
          {UPDATES.map((update, i) => (
            <motion.div 
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-container-lowest p-5 rounded-2xl editorial-shadow border border-outline-variant flex gap-4 items-start active:scale-[0.98] transition-transform duration-200"
            >
              <div className={cn("flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center", update.color)}>
                {update.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline font-bold text-on-surface text-base leading-tight">{update.title}</h3>
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">{update.time}</span>
                </div>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">{update.desc}</p>
              </div>
            </motion.div>
          ))}

          <div className="bg-surface-container-lowest editorial-shadow border border-outline-variant p-5 rounded-2xl flex gap-4 items-start active:scale-[0.98] transition-transform duration-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary fill-current" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-headline font-bold text-on-surface text-base leading-tight">Green Plate</h3>
                <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">Yesterday</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed">How was your lunch? Tap to rate your last meal at Green Plate.</p>
              <div className="mt-3 flex gap-1">
                {[1,2,3,4].map(i => <Star key={i} className="w-5 h-5 text-primary fill-current" />)}
                <Star className="w-5 h-5 text-outline-variant" />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-primary-dim text-on-primary p-6 rounded-[2rem] mt-8 group cursor-pointer">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Leaf className="w-32 h-32" />
            </div>
            <h4 className="font-headline font-bold text-xl mb-2">Sustainable Sunday</h4>
            <p className="text-on-primary/80 text-sm max-w-[70%] leading-relaxed">Participating messes are offering 15% off for those who bring their own containers today.</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-on-primary text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              Learn More
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
