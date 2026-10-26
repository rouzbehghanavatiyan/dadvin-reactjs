import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOtpSession } from '../hooks/slices/mainReducer';

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('userProfile');
    const savedMobile = localStorage.getItem('verifiedMobile');

    if (savedUser && savedMobile) {
      dispatch(setOtpSession({
        mobile: savedMobile,
        user: JSON.parse(savedUser)
      }));
    }
  }, [dispatch]);

  return children;
}
