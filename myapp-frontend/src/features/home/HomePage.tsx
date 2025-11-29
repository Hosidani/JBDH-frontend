
import React from 'react';
import FeatureCard from '../../components/FeatureCard';
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
    img: '/search_for_job.png',
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
    to: '/search',
    img: '/match_CV.png',
  },
  {
    title: t('home_feature_add_ad_title'),
    desc: t('home_feature_add_ad_desc'),
    to: '/boards',
    img: '/add_job.png',
  },
];


const HomePage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <div className="min-h-screen w-full bg-[#f7fafd] flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-10">
        <img
          src="/landing_page_big_image.png"
          alt={tSync('home_hero_alt')}
          className="w-full max-w-2xl rounded-lg object-cover mb-8 shadow"
          style={{ height: 260 }}
        />
      </section>
      {/* Feature Grid */}
      <section className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-12 mx-auto">
        {features(tSync).map((f, i) => (
          <FeatureCard key={i} to={f.to} img={f.img} title={f.title} desc={f.desc} />
        ))}
      </section>
    </div>
  );
};

export default HomePage;