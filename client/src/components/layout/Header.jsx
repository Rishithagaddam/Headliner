import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpeechToggle from '../speech/SpeechToggle';

export default function Header({ dark, setDark }) {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Home" },
    { to: "/chat", label: "Chat" },
    { to: "/category", label: "Categories" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-purple-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-300 tracking-tight flex items-center gap-2">
              <span className="animate-spin-slow">💠</span> Gemini News
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-2 py-1 text-sm font-medium transition ${
                    location.pathname === link.to
                      ? "text-purple-600 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300"
                  }`}
                >
                  {link.label}
                  {location.pathname === link.to && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-300 bottom-0"
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SpeechToggle />
            <button
              className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
              onClick={() => setDark(d => !d)}
            >
              {dark ? (
                <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}