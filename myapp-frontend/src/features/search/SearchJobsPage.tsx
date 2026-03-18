import React from 'react';
import { PageBackground, PageWrapper } from '../../components/common';
import { SearchJobsCard } from '../../components/search';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SearchJobsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);


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
