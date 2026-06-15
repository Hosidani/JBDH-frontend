import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LocalDbService } from '../../db/LocalDbService';

const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      const account = await LocalDbService.getAccountByEmail(user.email);
      if (!account) return;
      const own = await LocalDbService.getOwnCandidate(account.account_id);
      if (own) {
        navigate(`/candidate/${own.candidate_id}`, { replace: true });
      } else {
        navigate('/candidate', { replace: true });
      }
    })();
  }, [user, navigate]);

  return null;
};

export default MyProfilePage;
