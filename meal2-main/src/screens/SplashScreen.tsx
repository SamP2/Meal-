import { motion } from 'motion/react';
import { Utensils } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="editorial-gradient min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -z-10 w-[500px] h-[500px] bg-primary-container/30 rounded-full blur-[100px] -top-24 -left-24" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -z-10 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[80px] -bottom-24 -right-24" 
      />

      <main className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="w-24 h-24 mb-6 rounded-[2.5rem] bg-surface-container-lowest editorial-shadow flex items-center justify-center">
            <Utensils className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-headline font-extrabold text-6xl tracking-tighter text-primary">
            MessFinder
          </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="space-y-4 max-w-xs"
        >
          <p className="font-body text-xl font-medium text-on-surface leading-relaxed">
            Find trusted mess food near you
          </p>
          
          <div className="pt-12 flex justify-center">
            <div className="flex space-x-2">
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 rounded-full bg-primary" 
              />
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-primary" 
              />
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 rounded-full bg-primary" 
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Subliminal Texture Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL7JNOvamiSIXE_9Ik1zTGneF5zLMl6BbH7fhyGJumw4Q6OEiCHf9TWsxIbXhawMFkcencw4nimU96v8Bu4vxsEgw32OmtvtVO8c-cfC6dslgDbOVy3P4lE75tnTmwWDh4XQtygkrm2VUwlM2dzYCi-lymG_AQjc4TXizf-katkdZ6oVS9GUTfAvEK_9qkg_1r65cRwW6dQ_67v3jOfhJopYzpiwrpy_XaSmcd7aU0yEOtFVXvyAcn5w-4NGfkTxT_ETQjB7niuLon" 
          alt="" 
          className="w-full h-full object-cover mix-blend-overlay grayscale"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="fixed bottom-12 left-0 w-full flex justify-center opacity-40">
        <span className="font-label text-[10px] tracking-[0.2em] uppercase text-on-surface-variant font-bold">
          Naturally Curated • Simply Fresh
        </span>
      </div>
    </div>
  );
}
