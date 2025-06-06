import React from 'react';
import LogoPPL from './assets/logo-ppl.svg'; 
import { Globe } from 'lucide-react';
import { APP_VERSION, APP_BUILD_DATE } from './constants';
import type { Language } from './appTypes'; 

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string | string[];
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, t }) => {
  return (
    <div className="mb-8 pb-4 border-b border-gray-200">
      {/* Řádek 1: Logo, Verze a Přepínač */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <img src={LogoPPL} alt="PPL Logo" className="h-10 md:h-12" />
        </div>
        <div className="flex flex-col items-end">
          {/* Verze nahoře nad přepínačem jazyka */}
          <span className="text-xs text-gray-500 mb-2">
            {APP_VERSION} ({APP_BUILD_DATE})
          </span>

          <button
            className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700"
            onClick={toggleLanguage}
          >
            <Globe size={16} />
            {language === 'cs' ? 'EN' : 'CZ'}
          </button>
        </div>
      </div>
      {/* Řádek 2: Nadpis */}
      <h1 className="text-2xl md:text-2xl font-bold text-gray-800 text-center">
        {t('title') as string}
      </h1>
    </div>
  );
};

export default Header;
