import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createCheckoutSession } from '../services/stripeService';
import { Check, Zap, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';

export const Pricing: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  // Use the price IDs from environment variables, fallback to placeholders for UI testing
  const STRIPE_PRICE_ID_STARTER = import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_starter_123';
  const STRIPE_PRICE_ID_PRO = import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_123';

  const handleSubscribe = async (priceId: string, tier: string) => {
    console.log(`Attempting to subscribe to ${tier} with priceId: ${priceId}`);
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }
    
    setLoadingPriceId(priceId);
    try {
      await createCheckoutSession(priceId, user.uid, user.email || '', tier);
    } catch (error: any) {
      console.error("Subscription error:", error);
      const message = error?.message || "Failed to start checkout process. Please try again.";
      alert(`Subscription Error: ${message}\n\nNote: Ensure your Stripe API keys and Price IDs are correctly configured in the Secrets panel.`);
    } finally {
      setLoadingPriceId(null);
    }
  };

  const currentTier = profile?.tier || 'none';
  const hasPublishableKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-industrial-950 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {!user && (
          <Link to="/" className="inline-flex items-center text-zinc-muted hover:text-white mb-12 font-bold uppercase tracking-widest text-xs transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        )}
        
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6">
            Scale your <span className="text-accent-emerald">Molecular Intelligence</span>
          </h1>
          <p className="text-xl text-zinc-muted max-w-2xl mx-auto font-medium mb-8">
            Choose the plan that fits your lab's needs. From independent research to global manufacturing.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            {!hasPublishableKey && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 max-w-md">
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
                  ⚠ Missing VITE_STRIPE_PUBLISHABLE_KEY in Secrets.
                </p>
                <p className="text-red-400 text-[10px] mt-1">
                  Checkout redirection may fail without this key.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glass-panel border border-zinc-border rounded-[2.5rem] p-10 flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Starter</h3>
              <p className="text-zinc-muted font-medium">Perfect for small labs and independent researchers.</p>
              <div className="mt-8 flex items-baseline text-6xl font-black text-white tracking-tighter">
                $99
                <span className="ml-2 text-xl font-bold text-zinc-muted uppercase tracking-widest">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Basic Regulatory Alerts
              </li>
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Up to 50 Inventory Items
              </li>
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Standard Support
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe(STRIPE_PRICE_ID_STARTER, 'starter')}
              disabled={user && currentTier !== 'none' || loadingPriceId === STRIPE_PRICE_ID_STARTER}
              className="w-full bg-industrial-900 border border-zinc-border hover:bg-industrial-800 disabled:bg-industrial-950 disabled:text-zinc-muted text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm"
            >
              {loadingPriceId === STRIPE_PRICE_ID_STARTER ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              ) : !user ? (
                'Login to Subscribe'
              ) : currentTier === 'starter' ? (
                'Current Plan'
              ) : currentTier !== 'none' ? (
                'Included'
              ) : (
                'Get Started'
              )}
            </button>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel border-2 border-accent-emerald/50 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-2xl emerald-glow"
          >
            <div className="absolute top-0 right-0 bg-accent-emerald text-industrial-950 text-[10px] font-black px-4 py-2 rounded-bl-xl uppercase tracking-[0.2em]">
              Popular
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center uppercase tracking-tight">
                Pro <Zap className="w-5 h-5 text-accent-emerald ml-3 fill-accent-emerald" />
              </h3>
              <p className="text-zinc-muted font-medium">For growing teams and professional compliance officers.</p>
              <div className="mt-8 flex items-baseline text-6xl font-black text-white tracking-tighter">
                $499
                <span className="ml-2 text-xl font-bold text-zinc-muted uppercase tracking-widest">/mo</span>
              </div>
            </div>
            
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center text-white font-bold">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Everything in Starter
              </li>
              <li className="flex items-center text-white font-bold">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Substitution Engine Access
              </li>
              <li className="flex items-center text-white font-bold">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Up to 500 Inventory Items
              </li>
              <li className="flex items-center text-white font-bold">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Priority Support
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe(STRIPE_PRICE_ID_PRO, 'pro')}
              disabled={user && (currentTier === 'pro' || currentTier === 'enterprise') || loadingPriceId === STRIPE_PRICE_ID_PRO}
              className="w-full bg-accent-emerald hover:bg-emerald-400 disabled:bg-accent-emerald/50 text-industrial-950 font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-lg"
            >
              {loadingPriceId === STRIPE_PRICE_ID_PRO ? (
                <div className="w-5 h-5 border-2 border-industrial-950/20 border-t-industrial-950 rounded-full animate-spin mx-auto" />
              ) : !user ? (
                'Login to Subscribe'
              ) : currentTier === 'pro' ? (
                'Current Plan'
              ) : currentTier === 'enterprise' ? (
                'Included'
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel border border-zinc-border rounded-[2.5rem] p-10 flex flex-col"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center uppercase tracking-tight">
                Enterprise <Shield className="w-5 h-5 text-zinc-muted ml-3" />
              </h3>
              <p className="text-zinc-muted font-medium">For chemical manufacturers and global enterprises.</p>
              <div className="mt-8 flex items-baseline text-6xl font-black text-white tracking-tighter">
                Custom
              </div>
            </div>
            
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Unlimited Inventory & API
              </li>
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Digital Product Passports
              </li>
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                Custom Integrations
              </li>
              <li className="flex items-center text-zinc-muted font-medium">
                <Check className="w-5 h-5 text-accent-emerald mr-4 shrink-0" />
                24/7 Dedicated Support
              </li>
            </ul>
            
            <button 
              onClick={() => window.location.href = 'mailto:sales@chemxgen.com'}
              className="w-full bg-industrial-900 border border-zinc-border hover:bg-industrial-800 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-sm"
            >
              Contact Sales
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
