import { Compass, Bookmark, ReceiptText, User, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function BottomNavBar({ role = 'student' }: { role?: 'student' | 'owner' }) {
  const links = role === 'student' ? [
    { to: '/discover', icon: <Compass className="w-6 h-6" />, label: 'Discover' },
    { to: '/saved', icon: <Bookmark className="w-6 h-6" />, label: 'Saved' },
    { to: '/updates', icon: <Bell className="w-6 h-6" />, label: 'Updates' },
    { to: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' }
  ] : [
    { to: '/dashboard', icon: <Compass className="w-6 h-6" />, label: 'Today' },
    { to: '/manage-menu', icon: <ReceiptText className="w-6 h-6" />, label: 'Menus' },
    { to: '/owner-reviews', icon: <Bell className="w-6 h-6" />, label: 'Reviews' },
    { to: '/owner-profile', icon: <User className="w-6 h-6" />, label: 'Account' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-2 pb-8 bg-surface/80 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 ease-in-out rounded-full",
            isActive ? "bg-primary-container text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          )}
        >
          {link.icon}
          <span className="font-body text-[11px] font-semibold uppercase tracking-wider mt-0.5">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
