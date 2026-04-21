import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X, Star, Camera, Edit3, Lightbulb } from 'lucide-react';
import { MOCK_MESSES } from '../constants';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function ReviewScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mess = MOCK_MESSES.find(m => m.id === id) || MOCK_MESSES[0];
  const [rating, setRating] = useState(0);

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <header className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 glass-layer shadow-md shadow-black/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-on-surface-variant hover:bg-primary-container/20 transition-all duration-200 active:scale-95 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-primary">Write a Review</h1>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="font-headline font-bold text-primary hover:bg-primary-container/20 transition-all duration-200 active:scale-95 px-4 py-1 rounded-full"
        >
          Submit
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto flex flex-col gap-12">
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden editorial-shadow shadow-primary/5 bg-surface-container-lowest p-1 border border-outline-variant">
            <img 
              src={mess.image} 
              alt={mess.name} 
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">{mess.name}</h2>
            <p className="text-on-surface-variant italic">How was your visit today?</p>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button 
                key={i}
                onClick={() => setRating(i)}
                className={cn(
                  "transition-transform duration-150 hover:scale-110",
                  i <= rating ? "text-secondary" : "text-outline-variant"
                )}
              >
                <Star className={cn("w-12 h-12", i <= rating && "fill-current")} />
              </button>
            ))}
          </div>
          <span className="text-sm font-semibold tracking-widest uppercase text-secondary">
            {rating === 0 ? 'Select Rating' : rating === 5 ? 'Great Experience' : 'Good Experience'}
          </span>
        </section>

        <section className="flex flex-col gap-6">
          <div className="w-full">
            <textarea 
              className="w-full bg-surface-container-high border-none rounded-xl p-6 text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-highest transition-all resize-none" 
              placeholder="Share your experience..." 
              rows={6}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 p-4 bg-surface-container-low border border-outline-variant/15 rounded-xl hover:bg-surface-container-high transition-colors group">
              <Camera className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-on-surface-variant">Add Photos</span>
            </button>
            <button className="flex items-center justify-center gap-3 p-4 bg-surface-container-low border border-outline-variant/15 rounded-xl hover:bg-surface-container-high transition-colors group">
              <Edit3 className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-on-surface-variant">Add Tags</span>
            </button>
          </div>
        </section>

        <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-start gap-4">
            <div className="bg-primary-container/30 p-2 rounded-lg">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Review Tip</h4>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Mentioning specific items like their seasonal sourdough or organic honey helps others find the best picks!
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-primary text-on-primary font-headline font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-all"
            >
            Submit Review
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-4 px-8 leading-tight">
            By submitting, you agree to our Community Guidelines and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
