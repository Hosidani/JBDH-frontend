import React from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { SearchJobsCard } from '../../components/search';
import { useAuth } from '../../context/AuthContext';

const SearchJobsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageBackground imageUrl="/searchJobsPage.png" opacity={1} blur={0} />
      <PageWrapper>
        <SearchJobsCard />
      </PageWrapper>
    </>
  );
};

export default SearchJobsPage;
