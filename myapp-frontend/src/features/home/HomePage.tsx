
import React from 'react';

const features = [
  {
    title: 'Matcha ditt CV mot annonser',
    desc: 'Hitta jobbannonser som matchar din profil med ett enkelt klick!',
  },
  {
    title: 'Redigera din profil',
    desc: 'Se till att din profil och CV är up-to-date eller skapa en ny',
  },
  {
    title: 'Matcha annons mot CV:n',
    desc: 'Hitta kandidater som matchar din eller dina annonser',
  },
  {
    title: 'Lägg upp en annons',
    desc: 'Lägg upp en annons så den blir sökbar',
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
          <div key={i} className="bg-slate-100 rounded-lg p-5 flex flex-col h-44 shadow-sm border border-slate-200">
            <div className="flex-1 flex items-center justify-center text-2xl text-slate-300 font-bold mb-2">
              {/* Placeholder for icon/image */}
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="4" strokeDasharray="4 2" />
              </svg>
            </div>
            <div className="font-semibold text-base mb-1 text-slate-800">{f.title}</div>
            <div className="text-slate-500 text-sm">{f.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;