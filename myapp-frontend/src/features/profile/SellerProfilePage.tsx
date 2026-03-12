import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/ApiService';
import { PageWrapper } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapAccountType(type: number | string | undefined): string {
  if (type === 0 || type === 'Basic') return 'Basic';
  if (type === 1 || type === 'Premium') return 'Rekrytering - Medium';
  return String(type ?? '–');
}

function formatSellerId(id?: number | string): string {
  if (!id) return '–';
  return String(id).padStart(11, '0');
}

export default function SellerProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    Promise.all([ApiService.getMyProfile(), ApiService.getAccountSettings()])
      .then(([p, a]) => { setProfile(p); setAccount(a); })
      .catch(err => setError(err?.message ?? 'Något gick fel.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Laddar...</div>;
  if (error)   return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return null;

  const company = account?.organisations?.[0]?.name ?? '–';
  const title   = profile.selected_roles?.[0] ?? '–';
  const plan    = mapAccountType(account?.accountType);

  return (
    <PageWrapper>
      <div className="max-w-2xl w-full mx-auto mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative">

          {/* Settings gear */}
          <button
            onClick={() => navigate('/settings')}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Inställningar"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="absolute top-8 right-16">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xl select-none">
              {getInitials(profile.name)}
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 pr-28">
            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_name_label')}</div>
              <div className="font-semibold text-slate-800">{profile.name ?? '–'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_title_label')}</div>
              <div className="font-semibold text-slate-800">{title}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_company_label')}</div>
              <div className="font-semibold text-slate-800">{company}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_seller_id_label')}</div>
              <div className="font-semibold text-slate-800">{formatSellerId(profile.id)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_phone_label')}</div>
              <div className="font-semibold text-slate-800">{profile.phone_number ?? '–'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_email_label')}</div>
              <div className="font-semibold text-slate-800">{profile.email ?? '–'}</div>
            </div>

            <div className="col-span-2">
              <div className="text-xs text-slate-400 mb-0.5">{tSync('sellerProfilePage_plan_label')}</div>
              <div className="font-semibold text-slate-800">{plan}</div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
