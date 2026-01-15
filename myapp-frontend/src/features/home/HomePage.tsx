import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeatureCard, PageWrapper } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';


const features = (t: (key: string) => string) => [
  {
    title: t('home_feature_match_cv_jobad_title'),
    desc: t('home_feature_match_cv_jobad_desc'),
    to: '/compare-cv-jobad',
    img: '/match_CV_against_job.png',
  },
  {
    title: t('home_feature_match_cv_ads_title'),
    desc: t('home_feature_match_cv_ads_desc'),
    to: '/search',
    img: '/searchJobsPage.png',
  },
  {
    title: t('home_feature_edit_profile_title'),
    desc: t('home_feature_edit_profile_desc'),
    to: '/profile',
    img: '/edit_profile.png',
  },
  {
    title: t('home_feature_match_ad_cv_title'),
    desc: t('home_feature_match_ad_cv_desc'),
    to: '/match-ad-cvs',
    img: '/match_CV.png',
  },
  {
    title: t('home_feature_add_ad_title'),
    desc: t('home_feature_add_ad_desc'),
    to: '/add-job-ad',
    img: '/add_job.png',
  },
];


const HomePage: React.FC = () => {
  const { tSync } = useTranslation();
  const { user } = useAuth();
  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-10">
        <img
          src="/landing_page_big_image.png"
          alt={tSync('home_hero_alt')}
          className="w-full max-w-2xl rounded-lg object-cover mb-8 shadow"
          style={{ height: 260 }}
        />

      </section>
      <section className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-12 mx-auto">
        {features(tSync)
          .filter(f => f.to !== '/profile' || user)
          .map((f, i) => (
            <FeatureCard key={i} to={f.to} img={f.img} title={f.title} desc={f.desc} />
          ))}
        {user && (
          <FeatureCard
            to="/settings"
            img="/edit_profile.png"
            title={tSync('home_feature_settings_title') || 'Settings'}
            desc={tSync('home_feature_settings_desc') || 'Manage your account settings'}
          />
        )}
      </section>
    </PageWrapper>
  );
};

export default HomePage;