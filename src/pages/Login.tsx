import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router';
import { Beaker, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { Loading } from '../components/Loading';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const { user, signIn, signUp, login, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!companyName.trim()) {
          throw new Error('Company name is required');
        }
        await signUp(email, password, companyName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-emerald/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-industrial-800/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel rounded-3xl p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" className="flex-col text-center" />
          </div>
          <p className="text-zinc-muted font-medium leading-relaxed">
            {isSignUp ? 'Create your enterprise node' : 'Authenticate to secure gateway'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-mono text-sm"
                placeholder="operator@chemxgen.io"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-mono text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Company Entity</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-mono text-sm"
                    placeholder="Global Chem Corp"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-red-400 text-xs font-bold uppercase tracking-tighter text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center uppercase tracking-widest shadow-lg emerald-glow mt-6"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-industrial-950/20 border-t-industrial-950 rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Initialize Node' : 'Establish Connection'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
            <span className="bg-industrial-900 px-4 text-zinc-muted">Or</span>
          </div>
        </div>

        <button
          onClick={signIn}
          className="w-full bg-industrial-950 text-white hover:bg-industrial-800 border border-zinc-border font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          SSO AUTHENTICATION
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black text-accent-emerald hover:text-emerald-400 uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Already have a node? Authenticate →' : 'Need a new node? Initialize →'}
          </button>
        </div>
        
        <div className="mt-10 pt-8 border-t border-zinc-border">
          <p className="text-[10px] text-zinc-muted uppercase tracking-[0.2em] font-bold text-center">
            Secure Enterprise Gateway v4.2
          </p>
        </div>
      </motion.div>
    </div>
  );
};
