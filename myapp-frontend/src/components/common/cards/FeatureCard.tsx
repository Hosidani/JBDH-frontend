import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface FeatureCardProps {
  to: string;
  img?: string;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ to, img, title, desc }) => {
  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('requireLogin', { detail: { redirectTo: to } }));
    }
  };

  return (
  <Link to={to} onClick={handleClick} className="bg-slate-100 rounded-lg p-0 flex flex-col h-96 border border-slate-200 cursor-pointer overflow-hidden transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_6px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:bg-blue-50">
    {/* Image square */}
    <div className="flex items-center justify-center w-full bg-white" style={{ height: '55%', minHeight: 0, aspectRatio: '1/1', overflow: 'hidden' }}>
      {img ? (
        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <svg width="120" height="120" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="4" strokeDasharray="4 2" />
        </svg>
      )}
    </div>
    {/* Text square */}
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-4">
      <div className="font-semibold text-base mb-1 text-slate-800 text-center">{title}</div>
      <div className="text-slate-500 text-sm text-center">{desc}</div>
    </div>
  </Link>
  );
};

export default FeatureCard;
