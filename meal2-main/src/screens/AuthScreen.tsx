import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Leaf, School, Store, Mail, Eye, EyeOff, Apple } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'owner') {
      navigate('/dashboard');
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex items-center justify-center px-6 py-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">MessFinder</h1>
        </div>
      </header>

      <main className="w-full max-w-md px-6 pt-24 pb-12 min-h-screen flex flex-col editorial-gradient">
        <section className="mb-10 mt-8">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-4xl font-extrabold text-on-surface leading-tight mb-3"
          >
            Welcome to the Fresh Side.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant font-body text-lg leading-relaxed"
          >
            Find your next meal with curated local messes and community kitchens.
          </motion.p>
        </section>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-lowest p-8 rounded-[2rem] editorial-shadow border border-outline-variant flex flex-col gap-8"
        >
          <div className="flex p-1.5 bg-surface-container-high rounded-full w-full">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 px-6 rounded-full font-label font-semibold text-sm transition-all",
                isLogin ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 px-6 rounded-full font-label font-semibold text-sm transition-all",
                !isLogin ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              Sign Up
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant px-1">Select Your Role</span>
            <div className="flex gap-3">
              <button 
                onClick={() => setRole('student')}
                className={cn(
                  "flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border-2",
                  role === 'student' ? "border-primary-container bg-primary-container/20 text-on-primary-container" : "border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <School className="w-5 h-5" />
                <span className="font-label font-bold text-sm">Student</span>
              </button>
              <button 
                onClick={() => setRole('owner')}
                className={cn(
                  "flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border-2",
                  role === 'owner' ? "border-primary-container bg-primary-container/20 text-on-primary-container" : "border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <Store className="w-5 h-5" />
                <span className="font-label font-bold text-sm">Owner</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
              <div className="relative group">
                <input 
                  className="w-full h-14 px-5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all text-on-surface placeholder:text-on-surface-variant/40" 
                  placeholder="hello@messfinder.com" 
                  type="email"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <a className="text-[10px] font-label font-bold text-primary uppercase tracking-widest" href="#">Forgot Password?</a>
              </div>
              <div className="relative group">
                <input 
                  className="w-full h-14 px-5 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all text-on-surface placeholder:text-on-surface-variant/40" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button 
              className="w-full h-14 mt-2 bg-primary text-on-primary rounded-2xl font-headline font-bold text-lg shadow-lg active:scale-[0.98] transition-all" 
              type="submit"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-outline-variant/15"></div>
            <span className="text-xs font-label font-medium text-on-surface-variant">or continue with</span>
            <div className="h-[1px] flex-1 bg-outline-variant/15"></div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 h-14 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR60OyxRMsahLW1MYYCT4Q_Ssl3TOHHNDR-z5fphWpubSZIrRA_KmBE-9VrGZEH_5ujOFtRLND3VExDzcKXu9rcnHstYXdyZVYqFHGq4ZARSqnj823wak0YxgilFtNiPleKpeg2Thz5fVEE64ANnwAvd2rlRkWnqUL6avhixfEGBKWZFU6vj6VmtBpRz9uhxpDqMGHHXMDq1cXjf6z4xwGzA_kQN_uMZTstLWEXh6JJ4IxJuA4l8o9pW42rj0zk1oIrhiRXfpZbMvp" 
                alt="Google" 
                className="w-6 h-6"
                referrerPolicy="no-referrer"
              />
            </button>
            <button className="flex-1 h-14 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <Apple className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        <div className="mt-auto pt-12 flex flex-col items-center gap-8">
          <div className="w-full h-48 rounded-[2.5rem] overflow-hidden relative shadow-inner">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxGN12BYQz7cZcBhbcjOgeGAFEi4VsreCed9VjD5fquL0q3NCtxqDdsmuohU8DIQ4FMfFaon3G0RoZyagUYMnVWqw5jPuZWXkm6L02Y701pKIC3bioXT0rYn3Grx2V00s6_Es4pvWfVBPsB0Enn6i5oWtm0HO2eB4lhqyaclw0cJeNHtQ6tdrAPvsrPnEsaU-9MjdujhWkIFv3CCEWNpclmEx5a8DIetuoFd0oXcGpgL13ApwoZYkwtpyl4HOiv4o2pIkcp306p24l" 
              alt="Food" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
          <p className="text-on-surface-variant font-body text-xs text-center opacity-60 px-12">
            By signing in, you agree to our Terms of Service and Privacy Policy. Refresh your plate, refresh your life.
          </p>
        </div>
      </main>

      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-primary-container/30 blur-[80px] -z-10 rounded-full"></div>
      <div className="fixed top-48 -right-12 w-48 h-48 bg-secondary-container/20 blur-[60px] -z-10 rounded-full"></div>
    </div>
  );
}
