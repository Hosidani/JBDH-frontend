import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  to: string;
  img?: string;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ to, img, title, desc }) => (
  <Link to={to} className="bg-slate-100 rounded-lg p-0 flex flex-col h-96 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.09)] hover:bg-blue-50 transition-all cursor-pointer overflow-hidden">
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
    <div className="flex flex-col items-start justify-center flex-1 px-5 py-4">
      <div className="font-semibold text-base mb-1 text-slate-800">{title}</div>
      <div className="text-slate-500 text-sm">{desc}</div>
    </div>
  </Link>
);

export default FeatureCard;
