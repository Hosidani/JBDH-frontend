import React from 'react';
import { PageWrapper, PageBackground } from '../../components/common';
import SearchJobsCard from './SearchJobsCard';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

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
        <SearchJobsCard apiUrl={API_URL} />
      </PageWrapper>
    </>
  );
};

export default SearchJobsPage;
