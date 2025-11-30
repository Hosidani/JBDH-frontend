import React from 'react';
import PageWrapper from '../../components/PageWrapper';
import PageBackground from '../../components/PageBackground';
import SearchJobsCard from './SearchJobsCard';


const API_URL = import.meta.env.VITE_API_URL;

const SearchJobsPage: React.FC = () => {
  return (
    <>
      <PageBackground imageUrl="/searchJobsPage.png" opacity={1} blur={0} />
      <PageWrapper>
        <SearchJobsCard apiUrl={API_URL} />
      </PageWrapper>
    </>
  );
};

export default SearchJobsPage;
