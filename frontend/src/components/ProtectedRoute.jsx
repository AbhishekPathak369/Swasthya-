
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

const ProtectedRoute = ({ allowedRoles }) => {
  const [state, setState] = useState({
    loading: true,
    user: null,
    error: ''
  });

  useEffect(() => {
    let active = true;

    const verifyUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        if (active) {
          setState({
            loading: false,
            user: null,
            error: ''
          });
        }
        return;
      }

      try {
        const data = await getCurrentUser(token);

        if (active) {
          setState({
            loading: false,
            user: data.user,
            error: ''
          });
        }
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setState({
            loading: false,
            user: null,
            error: ''
          });
        } else {
          setState({
            loading: false,
            user: null,
            error: 'Unable to verify session. Please try again.'
          });
        }
      }
    };

    verifyUser();

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <p>Checking authentication...</p>;
  }

  if (state.error) {
    return <p role="alert">{state.error}</p>;
  }

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(state.user.role)
  ) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
