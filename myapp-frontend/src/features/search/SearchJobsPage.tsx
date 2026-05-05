import React from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import searchJobsImg from '../../assets/img/searchJobsPage.png';
import { SearchJobsCard } from '../../components/search';
import { useAuth } from '../../context/AuthContext';

const SearchJobsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageBackground imageUrl={searchJobsImg} opacity={1} blur={0} />
      <PageWrapper>
        <SearchJobsCard />
      </PageWrapper>
    </>
  );
};

export default SearchJobsPage;
