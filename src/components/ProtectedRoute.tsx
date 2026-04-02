import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  minTier?: 'starter' | 'pro' | 'enterprise';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, minTier }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (minTier) {
    const currentTier = profile?.tier || 'none';
    const tierOrder = { 'none': 0, 'starter': 1, 'pro': 2, 'enterprise': 3 };
    if (tierOrder[currentTier] < tierOrder[minTier]) {
      return <Navigate to="/pricing" replace />;
    }
  }

  return <>{children}</>;
};
