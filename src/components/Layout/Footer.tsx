import React from "react";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-600 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">pb</span>
              </div>
              <span className="text-xl font-semibold text-black dark:text-white">
                Puffy Bites
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Indulge in our premium selection of handcrafted desserts. Every
              bite is a moment of pure bliss, made with love and the finest
              ingredients.
            </p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              Made with <Heart className="w-4 h-4 mx-1 text-primary" /> by Puffy
              Bites Team
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-black dark:text-white">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Phone size={16} />
                <span>+234 8132806808</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <MapPin size={16} />
                <span>Karkasara Janbulo, Kano state</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; 2025 Puffy Bites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
