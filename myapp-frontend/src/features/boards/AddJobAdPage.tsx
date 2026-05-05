import React from 'react';
import { useTranslation } from '../../hooks/TranslationProvider';
import { PageWrapper, PageBackground } from '../../components/common';
import laptopWorkImg from '../../assets/img/Laptop-work.png';

const AddJobAdPage: React.FC = () => {
  const { tSync } = useTranslation();
  return (
    <>
      <PageBackground imageUrl={laptopWorkImg} opacity={1} blur={0} />
      <PageWrapper className="relative z-10">
        <div className="card relative z-10 p-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2563eb' }}>
            {tSync('addJobAdPage_title')}
          </h2>
          <p className="text-gray-600">
            {tSync('addJobAdPage_comingSoon')}
          </p>
        </div>
      </PageWrapper>
    </>
  );
};

export default AddJobAdPage;
