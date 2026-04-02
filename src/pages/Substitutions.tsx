import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { getMolecularAlternatives, MolecularAlternative } from '../services/geminiService';
import { Search, ArrowRight, Zap, Beaker, CheckCircle2, ShieldAlert, Leaf, Factory, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export const Substitutions: React.FC = () => {
  const location = useLocation();
  const [chemicalQuery, setChemicalQuery] = useState('');
  const [industrialUse, setIndustrialUse] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MolecularAlternative[] | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const chemical = searchParams.get('chemical');
    if (chemical) {
      setChemicalQuery(chemical);
      // If we have a chemical from the radar, we might not have the use yet
      // but we can still trigger a search with a default or wait for user input
    }
  }, [location]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chemicalQuery.trim()) return;

    setIsSearching(true);
    setResults(null);
    try {
      // Use a default use if none provided
      const use = industrialUse.trim() || "General Industrial Application";
      const options = await getMolecularAlternatives(chemicalQuery, use);
      setResults(options);
    } catch (error) {
      console.error("Failed to find substitutions:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center uppercase">
          <Zap className="w-10 h-10 mr-4 text-accent-emerald emerald-glow fill-accent-emerald/20" />
          Substitution Engine
        </h1>
        <p className="text-zinc-muted font-medium">AI-Powered Molecular Chemist: Find non-toxic, sustainable alternatives.</p>
      </header>

      <div className="glass-panel rounded-3xl p-8 border border-zinc-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-emerald to-transparent opacity-50"></div>
        
        <form onSubmit={handleSearch} className="space-y-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Restricted Chemical</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-muted" />
                <input
                  type="text"
                  value={chemicalQuery}
                  onChange={(e) => setChemicalQuery(e.target.value)}
                  placeholder="e.g., Benzene, X-42, PFAS..."
                  className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-medium"
                  disabled={isSearching}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Industrial Application</label>
              <div className="relative">
                <Factory className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-muted" />
                <input
                  type="text"
                  value={industrialUse}
                  onChange={(e) => setIndustrialUse(e.target.value)}
                  placeholder="e.g., Solvent in paint, Degreaser..."
                  className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-medium"
                  disabled={isSearching}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !chemicalQuery.trim()}
            className="w-full bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 font-black py-5 rounded-xl transition-all duration-300 flex items-center justify-center uppercase tracking-widest shadow-lg emerald-glow"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Consulting Molecular Database...
              </>
            ) : (
              <>
                Analyze Molecular Structure
                <ArrowRight className="w-5 h-5 ml-3" />
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-border pb-6">
              <Skeleton className="h-10 w-1/2 rounded-md" />
              <div className="text-right space-y-2">
                <Skeleton className="h-3 w-24 rounded-full ml-auto" />
                <Skeleton className="h-5 w-32 rounded-full ml-auto" />
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-industrial-900 border border-zinc-border rounded-3xl p-8 flex flex-col gap-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-3/4 rounded-md" />
                    <Skeleton className="h-6 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl mt-auto" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!isSearching && results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-border pb-6">
              <h3 className="text-2xl font-black text-white flex items-center uppercase tracking-tight">
                <CheckCircle2 className="w-8 h-8 text-accent-emerald mr-3" />
                Recommended Alternatives for "{chemicalQuery}"
              </h3>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Application Context</span>
                <p className="text-sm text-white font-medium">{industrialUse || "General Industrial"}</p>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {results.map((option, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className="bg-industrial-900 border border-zinc-border rounded-3xl p-8 hover:border-accent-emerald/50 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 bg-accent-emerald/10 text-accent-emerald text-[10px] font-black px-4 py-2 rounded-bl-2xl border-b border-l border-accent-emerald/20 uppercase tracking-widest">
                    {option.matchPercentage}% Match
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-2xl font-black text-white mb-1 pr-20 leading-tight uppercase tracking-tight">{option.name}</h4>
                    <p className="text-xs font-mono text-zinc-muted">CAS: {option.casNumber}</p>
                  </div>
                  
                  <div className="space-y-5 flex-grow">
                    <div className="bg-industrial-950/50 rounded-2xl p-4 border border-zinc-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-accent-emerald" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Safety Score</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-industrial-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${option.safetyScore}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={cn(
                              "h-full rounded-full",
                              option.safetyScore > 80 ? "bg-accent-emerald" : 
                              option.safetyScore > 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                          />
                        </div>
                        <span className="text-lg font-black text-white font-mono">{option.safetyScore}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Leaf className="w-4 h-4 text-accent-emerald mt-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest block mb-1">Sustainability</span>
                          <p className="text-xs text-white leading-relaxed font-medium">{option.sustainabilityBenefits}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest block mb-1">Functional Match</span>
                          <p className="text-xs text-white leading-relaxed font-medium">{option.functionalProperties}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-8 bg-industrial-950 hover:bg-industrial-800 text-white text-xs font-black py-4 rounded-xl transition-all border border-zinc-border uppercase tracking-widest shadow-lg">
                    Request Technical Data
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
