import { motion } from 'motion/react';
import { ArrowLeft, User, MapPin, Calendar, ChevronDown, CheckCircle2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const REQUESTS = [
  {
    id: '1',
    name: 'Green Plate',
    owner: 'Sarah Jennings',
    location: 'North District, Lane 4',
    date: 'Oct 24, 2023 • 10:45 AM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4IGcfUVRcrfNEEWQhgdhkBAzXFmH0_8dCrJvg2NQmimm9zVpdFV4U8rc7v63Bi-Izj4rWWOw4rBLlyf9xAbAgLAh9PgujO8wRAlmwsL2jw4y_UNAV44BxY2wupUY_PcyMyqQdqlvZ5ayJQw4wdqzweZvLFPyuKTTyWRu5ELdE8PETIiIucEmO-4HHLMS5yY4Lx1qYAbsrQh9VEKKNgTzb5VMUSRzHrOLcHIU5_iL7uuf34yZKznFp9G73-pCXQcgzUkpcL-ialV1i',
    verified: false
  },
  {
    id: '2',
    name: 'Hearthstone Organic',
    owner: 'Marcus Thorne',
    location: 'Old Market St, Downtown',
    date: 'Oct 23, 2023 • 04:20 PM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD7_0PvGiAMZSwdj0rk35dBZhlRJKLbsV9Ts3ue832AP2vMizBRWb1bwVpFRYNtba3CAQ1gcYKVTLKY3Skg5Uf_djm9yFRJnxOQsX__AvUhw7n0VgiO_O1HveHD3ZA2oQJkJRPPmqOkgX8dgQpvqjNzA5TnNEsza-ioMOwEr9x0lrLEL8NJRNDqSz6lESmaPhASNsdvkYsc_UwKKyx83jOC9ToS5hKJMhH0IC7iwNAw78iUtJRCSO2Fi9kehd2YhGZG1tt66WhHAN0',
    verified: false
  },
  {
    id: '3',
    name: 'Verdant Bowl',
    owner: 'Elara Kim',
    location: 'Oak Ridge District',
    date: 'Oct 22, 2023 • 09:15 AM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWvYLVzXcDHmaQcCvjzacsqU2yso2Sg--4oVkZYr3Fh56A46_VAqDcQRmpCNX9ak6AZhG70YlnyaTpIKktEpu1BxOzS0L_46Zw-IJjeKbPhhIhzi_VGyoEXdsn-vmAPD23tg_VcRvMPXj3bdUkoHCSXuHlU7kq01l_rbA4O2ogjpGwAru2HMvhZKnd5dY-VeRmCIkwHsX-TeDlS_5xiB-ViwOpmjhnQGDG0anENqJPScZVWTipGlJfn3J2uCFgJq7rJYKobu9A-CQd',
    verified: true
  }
];

export default function VerificationScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
        <div className="flex items-center px-4 h-16 w-full max-w-5xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-zinc-100 transition-colors active:scale-95 duration-200 text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 font-headline font-bold text-lg text-primary">Verification</h1>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 max-w-3xl mx-auto space-y-6">
        <div className="bg-surface-container-lowest editorial-shadow border border-outline-variant rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-label text-on-surface-variant">Pending Approvals</p>
            <h2 className="text-3xl font-headline font-extrabold text-primary">12 Messes</h2>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">Priority: High</span>
            <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">Queue: Active</span>
          </div>
        </div>

        <div className="space-y-4">
          {REQUESTS.map((req) => (
            <div key={req.id} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 border border-outline-variant editorial-shadow">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={req.image} 
                  alt={req.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline font-bold text-lg text-on-surface truncate">{req.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Verify</span>
                    <button className={cn(
                      "w-10 h-6 rounded-full relative transition-colors p-1",
                      req.verified ? "bg-primary-container" : "bg-surface-container-highest"
                    )}>
                      <span className={cn(
                        "block w-4 h-4 rounded-full shadow-sm transition-transform",
                        req.verified ? "bg-primary translate-x-4" : "bg-white"
                      )}></span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <User className="w-4 h-4" />
                    <span className="truncate">{req.owner}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{req.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm col-span-full">
                    <Calendar className="w-4 h-4" />
                    <span>{req.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <button className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-surface-container-highest transition-colors active:scale-95 duration-200 flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            View More Requests
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white shadow-lg rounded-t-3xl border-t border-outline-variant/10">
        <div className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2">
          <Calendar className="w-6 h-6 mb-1" />
          <span className="font-body text-xs font-medium">Pending</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-primary-container text-primary rounded-2xl px-5 py-2">
          <CheckCircle2 className="w-6 h-6 mb-1" />
          <span className="font-body text-xs font-medium">Verified</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant px-5 py-2">
          <Settings className="w-6 h-6 mb-1" />
          <span className="font-body text-xs font-medium">Settings</span>
        </div>
      </nav>
    </div>
  );
}
