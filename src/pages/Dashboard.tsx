import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChemicalAnalysis, createAnalysis, subscribeToAnalyses, deleteAnalysis, updateAnalysis } from '../services/analysisService';
import { InventoryItem, RegulatoryAlert, ProductPassport, subscribeToInventory, subscribeToAlerts, subscribeToPassports } from '../services/chemService';
import { Beaker, Plus, Trash2, Activity, Play, CheckCircle, AlertCircle, Package, Radar, QrCode, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [analyses, setAnalyses] = useState<ChemicalAnalysis[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [passports, setPassports] = useState<ProductPassport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [compoundName, setCompoundName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    
    const unsubAnalyses = subscribeToAnalyses(user.uid, (data) => {
      setAnalyses(data);
      setIsLoading(false);
    });
    const unsubInventory = subscribeToInventory(user.uid, setInventory);
    const unsubAlerts = subscribeToAlerts(user.uid, setAlerts);
    const unsubPassports = subscribeToPassports(user.uid, setPassports);
    
    return () => {
      unsubAnalyses();
      unsubInventory();
      unsubAlerts();
      unsubPassports();
    };
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compoundName.trim() || !user) return;
    
    // Check subscription limits
    if (profile?.subscriptionStatus !== 'active' && analyses.length >= 3) {
      alert('Free tier limit reached. Please upgrade to Pro to generate more analyses.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create pending analysis
      const newId = await createAnalysis({
        userId: user.uid,
        compoundName: compoundName.trim(),
        status: 'pending'
      });
      
      setCompoundName('');
      
      // Simulate backend processing by updating the document after a delay
      setTimeout(async () => {
        try {
          await updateAnalysis(newId, {
            status: 'completed',
            formula: 'C' + Math.floor(Math.random() * 20 + 1) + 'H' + Math.floor(Math.random() * 30 + 1) + 'O' + Math.floor(Math.random() * 10 + 1),
            molecularWeight: Math.floor(Math.random() * 400 + 100) + Math.random()
          });
        } catch (e) {
          console.error("Failed to update analysis status", e);
        }
      }, 3000);
      
    } catch (error) {
      console.error("Failed to generate analysis:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id);
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'processing': return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Play className="w-5 h-5 text-slate-500" />;
    }
  };

  const stats = [
    { name: 'Inventory Items', value: inventory.length, icon: Package, color: 'text-blue-500', path: '/inventory' },
    { name: 'Active Alerts', value: alerts.length, icon: Radar, color: alerts.length > 0 ? 'text-red-500' : 'text-emerald-500', path: '/radar' },
    { name: 'Product Passports', value: passports.length, icon: QrCode, color: 'text-purple-500', path: '/passports' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3">Operational Dashboard</h1>
        <p className="text-zinc-muted font-medium">Real-time molecular synthesis and compliance monitoring.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-5 h-5 rounded-md" />
              </div>
              <Skeleton className="h-8 w-1/4 mb-2 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.path}
              className="glass-panel p-6 rounded-2xl group hover:border-accent-emerald/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-industrial-950 border border-zinc-border", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-zinc-muted group-hover:text-accent-emerald transition-colors" />
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-zinc-muted uppercase tracking-widest">{stat.name}</div>
            </Link>
          ))
        )}
      </div>

      {/* Generator Card */}
      <div className="glass-panel rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-emerald/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <h2 className="text-xl font-bold text-white mb-6 flex items-center uppercase tracking-wider">
          <Beaker className="w-5 h-5 mr-3 text-accent-emerald" />
          Initiate Synthesis
        </h2>
        
        <form onSubmit={handleGenerate} className="flex gap-4 relative z-10">
          <input
            type="text"
            value={compoundName}
            onChange={(e) => setCompoundName(e.target.value)}
            placeholder="Enter compound signature..."
            className="flex-1 bg-industrial-950 border border-zinc-border rounded-xl px-6 py-4 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-mono"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !compoundName.trim()}
            className="bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 font-black px-10 py-4 rounded-xl transition-all duration-300 flex items-center uppercase tracking-widest shadow-lg emerald-glow"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-industrial-950/20 border-t-industrial-950 rounded-full animate-spin mr-3" />
            ) : (
              <Plus className="w-5 h-5 mr-3" />
            )}
            Execute
          </button>
        </form>
        
        {profile?.subscriptionStatus !== 'active' && (
          <div className="mt-6 flex items-center justify-between p-4 bg-industrial-950/50 rounded-xl border border-zinc-border">
            <p className="text-xs font-bold text-zinc-muted uppercase tracking-widest">
              Node Capacity: <span className="text-white">{analyses.length} / 3</span>
            </p>
            <Link to="/pricing" className="text-[10px] font-black text-accent-emerald hover:text-emerald-400 uppercase tracking-widest transition-colors">
              Expand Capacity →
            </Link>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Recent Logs</h3>
          <div className="h-px flex-1 mx-6 bg-zinc-border"></div>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-6 w-full">
                  <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-7 w-1/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 glass-panel border-dashed rounded-3xl">
            <Beaker className="w-16 h-16 text-industrial-800 mx-auto mb-6" />
            <p className="text-zinc-muted font-bold uppercase tracking-widest">No active logs found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={analysis.id}
                className="glass-panel rounded-2xl p-6 flex items-center justify-between group hover:border-accent-emerald/30 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-industrial-950 p-4 rounded-xl border border-zinc-border group-hover:border-accent-emerald/20 transition-colors">
                    {getStatusIcon(analysis.status)}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl tracking-tight uppercase">{analysis.compoundName}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-muted mt-2 uppercase tracking-widest">
                      <span className={cn(
                        "px-2 py-0.5 rounded border",
                        analysis.status === 'completed' ? "text-accent-emerald border-accent-emerald/20 bg-accent-emerald/5" : "text-zinc-muted border-zinc-border"
                      )}>
                        {analysis.status}
                      </span>
                      {analysis.createdAt && (
                        <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  {analysis.status === 'completed' && (
                    <div className="text-right hidden md:block">
                      <div className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mb-1">Molecular Signature</div>
                      <div className="text-lg text-accent-emerald font-mono font-bold">{analysis.formula || 'C8H10N4O2'}</div>
                    </div>
                  )}
                  <button
                    onClick={() => analysis.id && handleDelete(analysis.id)}
                    className="p-3 text-zinc-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
