import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Utensils, Pizza, Compass, Clock, ShieldCheck, Leaf } from 'lucide-react';
import { cn } from '../lib/utils';

const STEPS = [
  {
    title: "Find Great Food Near You",
    description: "Discover trusted mess options in your neighborhood with real-time location tracking. Fresh meals are just a few steps away.",
    image: (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-surface-container-low rounded-2xl overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEKl2kXe6dhF_jxnNmBvaNkeAuG5punhMco9Jz76kdyIwg2H4z6wkyDr53V7yxmI4dcrNC6odX9wVgHpieDMATssLO19DcuSWoHIrV5LLlVz5ikfrNzmjwx5DBpiS2yw0MhefuWFBpfchQ3gkbT070zyoU6sFih229taxU0stTNSEf8-uS8KnMBSEAdDzpuABTtbbZFOBePARWUQ_shPxbBl-aHLbtKW7Sp834y1zpyr6ZJ1EXzZH8JEYTw7BZiUIRHqeRjq05I5Ry" 
            alt="Map"
            className="w-full h-full object-cover opacity-40 mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary flex items-center justify-center rounded-full editorial-shadow z-10">
            <MapPin className="text-white w-10 h-10 fill-current" />
          </div>
          <div className="mt-4 bg-surface-container-lowest/90 backdrop-blur-md px-6 py-3 rounded-full editorial-shadow border border-white/20">
            <span className="text-on-surface font-semibold text-sm">Nearby Mess Found</span>
          </div>
        </div>
        <div className="absolute top-1/4 right-1/4 bg-secondary-container text-on-secondary-container p-3 rounded-full editorial-shadow">
          <Utensils className="w-6 h-6" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 bg-tertiary-container text-on-tertiary-container p-3 rounded-full editorial-shadow">
          <Pizza className="w-6 h-6" />
        </div>
      </div>
    ),
    features: [
      { icon: <Compass className="w-6 h-6" />, title: "Curated List", desc: "We only list mess services that pass our rigorous quality and hygiene standards." },
      { icon: <Clock className="w-6 h-6" />, title: "Real-Time Slots", desc: "Check current availability and menu for the next meal in real-time." },
      { icon: <ShieldCheck className="w-6 h-6" />, title: "Verified Reviews", desc: "Read authentic feedback from regular diners to choose your perfect meal spot." }
    ]
  },
  {
    title: "Menus & Reviews",
    description: "Check out daily menus, read authentic reviews, and see ratings from other foodies.",
    image: (
      <div className="relative w-full h-full flex flex-col justify-center gap-6">
        <div className="relative z-20 self-start w-56 aspect-[4/5] bg-surface-container-lowest rounded-[2.5rem] p-4 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] transform -rotate-3">
          <div className="w-full h-full rounded-[1.75rem] overflow-hidden relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD89vyQk1FrApCyes2JqJpAwJNpNjRaGJJi6iSyca8ULwnqUjApfR3zDNT-TJL6lU6XaMlKk8FRfC7y339BtcOcwSlDNQQm9fkcf5BmMPa6ZLxtsb0q0eoMT76JOKYpI-m8NXfMe_hRWfMmy2kqC0X9PaoATUXXnM-37Qoh-zymQJRPn0GqY0FNjcK7BD4ojzzK4eDWNMsOSBrYD_5n2udlkob5KoLJOB2BnZdIKQBs8j4-qyBgnSHqxCZ_rSEUfjGgC3v3wBPDJ9x" 
              alt="Food"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 right-3 glass-layer rounded-xl p-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Today's Special</p>
              <p className="text-sm font-headline font-bold text-on-surface">Avocado Zest Bowl</p>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-1/4 z-30 w-48 bg-surface-container-lowest rounded-3xl p-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)] transform rotate-6 border border-white/20">
          <div className="flex gap-1 mb-2 text-secondary">
            {[1,2,3,4,5].map(i => <ShieldCheck key={i} className="w-3 h-3 fill-current" />)}
          </div>
          <p className="text-xs italic leading-relaxed text-on-surface-variant">"The best home-cooked meal I've had in weeks. Tastes like mom's recipe!"</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-[10px] font-bold text-on-primary-container">SJ</span>
            </div>
            <span className="text-[10px] font-semibold text-on-surface">Sarah J.</span>
          </div>
        </div>
        <div className="absolute bottom-10 right-4 z-10 w-32 h-32 rounded-full border-[12px] border-surface-container-high flex flex-col items-center justify-center transform scale-110">
          <span className="text-3xl font-headline font-extrabold text-primary">4.9</span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Rating</span>
        </div>
      </div>
    )
  },
  {
    title: "Own a Mess?",
    description: "List your mess and manage your daily menus and customer orders with ease.",
    image: (
      <div className="relative w-full h-full flex flex-col p-4 gap-8">
        <div className="bg-surface-container-lowest shadow-xl p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase">TODAY'S ORDERS</p>
            <p className="text-3xl font-headline font-extrabold text-primary">42</p>
          </div>
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
            <Utensils className="w-6 h-6 text-on-primary-container" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-bold text-on-surface-variant">Menu</span>
            </div>
            <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-3/4"></div>
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant font-medium">8 Items Active</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-6 h-6 text-primary mb-1 fill-current" />
            <p className="text-xs font-bold">4.8 Rating</p>
          </div>
        </div>
        <div className="flex-grow bg-surface-container-lowest shadow-md rounded-xl overflow-hidden flex flex-col">
          <div className="relative h-24">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwHqXHie2PTPmwC_1iMBuLdXW9J-nonUmEijjYihOhPuYFC6UCh62NSixEM6OleGmIQba6amTUgTN62AILiSOnP9wZGOUiT40kWf9Bk93E_GeYcFcC5ZnEzY71vE6QMxyu2mnCF2ESl-ppCEV8L8svIjEtr53usVGQGqFvKptqiR06r_mbvoRxKZmnxMnZxNOnYqIRiVUl59aTqisUfq7Xs1OtWN1eJDtZ4OQkSmtm7kymMOT7QM_091m68l8LzHYlGckZ-VpF1JYN" 
              alt="Mess"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-3 left-4">
              <h4 className="text-white font-headline font-bold text-sm">Central Mess Hall</h4>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-bold">OPEN NOW</span>
          </div>
        </div>
      </div>
    )
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/auth');
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="font-headline font-extrabold text-xl text-primary">MessFinder</span>
        </div>
        <button 
          onClick={() => navigate('/auth')}
          className="font-headline font-bold tracking-tight text-lg text-on-surface-variant hover:bg-primary-container/20 transition-colors px-4 py-1 rounded-full active:opacity-80"
        >
          Skip
        </button>
      </header>

      <main className="flex-grow flex flex-col pt-16 relative">
        <section className="flex-grow flex flex-col md:flex-row items-center justify-center px-6 md:px-12 py-12 gap-12 hero-gradient">
          <div className="w-full md:w-1/2 flex justify-center items-center relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl"></div>
            <motion.div 
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative w-full max-w-md aspect-square bg-surface-container-lowest editorial-shadow rounded-[3rem] overflow-hidden p-8 flex flex-col justify-center items-center"
            >
              {currentStep.image}
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-start space-y-8 md:pl-12">
            <AnimatePresence mode="wait">
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tight">
                  {currentStep.title.split(' ').slice(0, -2).join(' ')} <br/>
                  <span className="text-primary italic">{currentStep.title.split(' ').slice(-2).join(' ')}</span>
                </h1>
                <p className="font-body text-xl text-on-surface-variant max-w-lg leading-relaxed">
                  {currentStep.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Onboarding Progress</span>
                <span className="font-label text-xs font-bold text-primary">{step + 1} of 3</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <button 
                onClick={next}
                className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-headline font-bold text-lg editorial-shadow active:scale-95 transition-all hover:opacity-90"
              >
                {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
              </button>
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === step ? "w-8 bg-primary" : "w-2 bg-surface-container-highest"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {step === 0 && (
          <section className="bg-surface-container-low py-20 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {currentStep.features?.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow space-y-4"
                >
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h3 className="font-headline font-bold text-xl">{f.title}</h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
