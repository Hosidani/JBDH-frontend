import React from 'react';
import { FeatureCard, PageWrapper } from '../../components/common';
import { useTranslation } from '../../hooks/TranslationProvider';
import { useRoles } from '../../hooks/useRoles';
import welcomeImg from '../../assets/img/Welcome.png';
import matchCvJobImg from '../../assets/img/match_CV_against_job.png';
import searchJobsImg from '../../assets/img/searchJobsPage.png';
import editProfileImg from '../../assets/img/edit_profile.png';
import matchCvImg from '../../assets/img/match_CV.png';
import addJobImg from '../../assets/img/add_job.png';
import landingPageImg from '../../assets/img/landing_page_big_image.png';

const features = (t: (key: string) => string) => [
  {
    title: t('home_feature_register_title'),
    desc: t('home_feature_register_desc'),
    to: '/register',
    img: welcomeImg,
    guestOnly: true,
    requiresAuth: false,
  },
  {
    title: t('home_feature_match_cv_jobad_title'),
    desc: t('home_feature_match_cv_jobad_desc'),
    to: '/compare-cv-jobad',
    img: matchCvJobImg,
  },
  {
    title: t('home_feature_match_cv_ads_title'),
    desc: t('home_feature_match_cv_ads_desc'),
    to: '/search',
    img: searchJobsImg,
  },
  {
    title: t('home_feature_edit_profile_title'),
    desc: t('home_feature_edit_profile_desc'),
    to: '/profile',
    img: editProfileImg,
    roles: ['User'],
  },
  {
    title: t('home_feature_match_ad_cv_title'),
    desc: t('home_feature_match_ad_cv_desc'),
    to: '/jobs-and-cvs',
    img: matchCvImg,
  },
  {
    title: t('home_feature_add_ad_title'),
    desc: t('home_feature_add_ad_desc'),
    to: '/add-job-ad',
    img: addJobImg,
  },
];

const HomePage: React.FC = () => {
  const { tSync } = useTranslation();
  const { isLoggedIn, hasAnyRole } = useRoles();

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="w-full flex flex-col py-10">
        <img
          src={landingPageImg}
          alt={tSync('home_hero_alt')}
          className="w-full rounded-lg object-cover mb-8 shadow"
          style={{ height: 260 }}
        />
      </section>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
        {features(tSync)
          .filter(f => {
            if (f.guestOnly && isLoggedIn) return false;
            if (f.roles && isLoggedIn && !hasAnyRole(f.roles)) return false;
            return true;
          })
          .map((f, i) => (
            <FeatureCard key={i} to={f.to} img={f.img} title={f.title} desc={f.desc} requiresAuth={f.requiresAuth} />
          ))}
      </section>
    </PageWrapper>
  );
};

export default HomePage;
