import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';

const Footer: React.FC = () => {
  const { tSync } = useTranslation();

  return (
    <footer className="relative z-10 w-full bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="w-[80%] max-w-full mx-auto px-4 flex flex-col sm:flex-row gap-8 sm:gap-16 text-sm text-slate-600">

        {/* JBDH */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-800">{tSync('footer_group_jbdh')}</span>
          <Link to="/about" className="hover:text-blue-600 transition-colors">{tSync('footer_link_about')}</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">{tSync('footer_link_contact')}</Link>
        </div>

        {/* Log House */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-800">{tSync('footer_group_loghouse')}</span>
          <a href="https://www.loghouse.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            {tSync('footer_link_loghouse')}
          </a>
        </div>

        {/* Juridik */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-slate-800">{tSync('footer_group_legal')}</span>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">{tSync('footer_link_terms')}</Link>
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">{tSync('footer_link_privacy')}</Link>
          <Link to="/eula" className="hover:text-blue-600 transition-colors">{tSync('footer_link_eula')}</Link>
        </div>

      </div>
      <div className="w-[80%] max-w-full mx-auto px-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
        © {new Date().getFullYear()} Log House AB
      </div>
    </footer>
  );
};

export default Footer;
