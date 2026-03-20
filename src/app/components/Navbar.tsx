import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, PlusCircle, LogOut, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useAuth } from '../utils/auth';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'New Form', path: '/form/new', icon: PlusCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">QR COLLECT</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`relative px-4 h-10 rounded-xl transition-all font-semibold ${
                  isActive 
                    ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-indigo-600' : ''}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Button>
            );
          })}
          
          <div className="w-px h-6 bg-slate-200 mx-2" />
          
          <Button
            variant="ghost"
            onClick={logout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium px-4"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Mobile Logout Only (Simplified for now) */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-slate-500 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
