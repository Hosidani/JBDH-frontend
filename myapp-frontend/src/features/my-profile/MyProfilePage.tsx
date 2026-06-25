import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalDbService } from '../../db/LocalDbService';

const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const account = await LocalDbService.getAccount();
      if (!account) return;
      const own = await LocalDbService.getOwnCandidate(account.account_id);
      if (own) {
        navigate(`/candidate/${own.candidate_id}`, { replace: true });
      } else {
        navigate('/candidate?own=1', { replace: true });
      }
    })();
  }, [navigate]);

  return null;
};

export default MyProfilePage;
