import React from 'react';
import FeatureCard from '../../components/FeatureCard';

const features = [
  {
    title: 'Matcha CV mot jobbannons',
    desc: 'Låt AI analysera hur väl ditt CV matchar en specifik jobbannons.',
    to: '/compare-cv-jobad',
    img: '/match_CV_against_job.png',
  },
  {
    title: 'Matcha ditt CV mot annonser',
    desc: 'Hitta jobbannonser som matchar din profil med ett enkelt klick!',
    to: '/search',
    img: '/search_for_job.png',
  },
  {
    title: 'Redigera din profil',
    desc: 'Se till att din profil och CV är up-to-date eller skapa en ny',
    to: '/profile',
    img: '/edit_profile.png',
  },
  {
    title: 'Matcha annons mot CV:n',
    desc: 'Hitta kandidater som matchar din eller dina annonser',
    to: '/search',
  },
  {
    title: 'Lägg upp en annons',
    desc: 'Lägg upp en annons så den blir sökbar',
    to: '/boards',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#f7fafd] flex flex-col items-center">
      {/* Hero Section */}

      <section className="w-full flex flex-col items-center justify-center py-10">
        <img
          src="/landing_page_big_image.png"
          alt="Team planning at whiteboard"
          className="w-full max-w-2xl rounded-lg object-cover mb-8 shadow"
          style={{ height: 260 }}
        />
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-12 mx-auto">
        {features.map((f, i) => (
          <FeatureCard key={i} to={f.to} img={f.img} title={f.title} desc={f.desc} />
        ))}
      </section>
    </div>
  );
};

export default HomePage;