import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, Clock, ShieldCheck, Star } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroSection: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-primary-600 to-amber-600 text-white py-16 sm:py-24 rounded-3xl shadow-2xl mb-12">
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-200 border border-white/20">
          <Flame className="w-4 h-4 text-amber-300" /> Sri Lanka's #1 Food Ordering App
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Craving Delicious Food? <br />
          <span className="text-amber-300 underline decoration-amber-400/50">Delivered Hot & Fast</span>
        </h1>

        <p className="text-base sm:text-xl text-orange-100 max-w-2xl mx-auto font-medium">
          Order from Colombo's top restaurants. From sizzling Cheese Chicken Kottu to wood-fired Neapolitan Pizzas & authentic Rice & Curry thalis.
        </p>

        {/* Hero Search Box */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter dish, restaurant, or cuisine (e.g. Kottu, Pizza)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-none bg-transparent text-gray-900 dark:text-white text-base focus:outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <Button variant="primary" size="lg" type="submit" className="sm:w-auto w-full py-3.5">
            Find Food
          </Button>
        </form>

        {/* Value Highlights */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/15 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-orange-200 font-semibold">Fast Delivery</p>
              <p className="text-sm font-bold text-white">25-35 Mins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-xs text-orange-200 font-semibold">Top Rated</p>
              <p className="text-sm font-bold text-white">4.8★ Average</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-orange-200 font-semibold">Live Tracking</p>
              <p className="text-sm font-bold text-white">Real-Time Updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md text-amber-300">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-orange-200 font-semibold">Verified Quality</p>
              <p className="text-sm font-bold text-white">Freshly Cooked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
