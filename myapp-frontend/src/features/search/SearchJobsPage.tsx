import React from 'react';
import { PageBackground } from '../../components/common';
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
      <div className="w-full mx-auto mt-8 px-6">
        <SearchJobsCard />
      </div>
    </>
  );
};

export default SearchJobsPage;
