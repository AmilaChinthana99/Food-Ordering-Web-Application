import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-12 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand & info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">FoodieExpress</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              Sri Lanka's premiere food delivery platform. Delivering sizzling hot Kottu, authentic Rice & Curry, wood-fired Pizzas, and gourmet Desserts straight to your doorstep.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Payment Methods:</span>
              <span className="text-xs font-bold text-gray-300">Stripe Card • COD</span>
            </div>
          </div>

          {/* Popular Cuisines */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cuisines</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/restaurants?cuisine=Kottu" className="hover:text-primary-400 transition-colors">Sri Lankan Kottu</Link></li>
              <li><Link to="/restaurants?cuisine=Rice" className="hover:text-primary-400 transition-colors">Rice & Curry</Link></li>
              <li><Link to="/restaurants?cuisine=Italian" className="hover:text-primary-400 transition-colors">Pizza & Italian</Link></li>
              <li><Link to="/restaurants?cuisine=Burgers" className="hover:text-primary-400 transition-colors">Gourmet Burgers</Link></li>
              <li><Link to="/restaurants?cuisine=Healthy" className="hover:text-primary-400 transition-colors">Salads & Healthy</Link></li>
            </ul>
          </div>

          {/* Delivery Locations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Delivery Cities</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-primary-400 transition-colors">Colombo 01 - 15</li>
              <li className="hover:text-primary-400 transition-colors">Nawala & Rajagiriya</li>
              <li className="hover:text-primary-400 transition-colors">Dehiwala & Mount Lavinia</li>
              <li className="hover:text-primary-400 transition-colors">Nugegoda & Kotte</li>
              <li className="hover:text-primary-400 transition-colors">Battaramulla</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span>+94 11 700 8000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                <span>support@foodieexpress.lk</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                <span>Galle Road, Colombo 03</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FoodieExpress (Pvt) Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for food lovers in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};
