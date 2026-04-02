/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { RegulatoryRadar } from './pages/Radar';
import { Substitutions } from './pages/Substitutions';
import { Passports } from './pages/Passports';
import { Pricing } from './pages/Pricing';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'glass-panel !bg-industrial-900 !text-slate-200 !border-zinc-border !rounded-2xl !p-4 !shadow-2xl',
            duration: 5000,
            style: {
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f172a',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/radar" element={
                <ProtectedRoute>
                  <RegulatoryRadar />
                </ProtectedRoute>
              } />
              <Route path="/substitutions" element={
                <ProtectedRoute minTier="pro">
                  <Substitutions />
                </ProtectedRoute>
              } />
              <Route path="/passports" element={
                <ProtectedRoute minTier="enterprise">
                  <Passports />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
