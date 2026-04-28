import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeatureCard, PageWrapper } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';


const features = (t: (key: string) => string) => [
  {
    title: t('home_feature_register_title'),
    desc: t('home_feature_register_desc'),
    to: '/register',
    img: '/edit_profile.png',
    guestOnly: true,
    requiresAuth: false,
  },
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
      <section className="w-full flex flex-col py-10">
        <img
          src="/landing_page_big_image.png"
          alt={tSync('home_hero_alt')}
          className="w-full rounded-lg object-cover mb-8 shadow"
          style={{ height: 260 }}
        />

      </section>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
        {features(tSync)
          .filter(f => (!f.guestOnly || !user) && (f.to !== '/profile' || user))
          .map((f, i) => (
            <FeatureCard key={i} to={f.to} img={f.img} title={f.title} desc={f.desc} requiresAuth={f.requiresAuth} />
          ))}
      </section>
    </PageWrapper>
  );
};

export default HomePage;
