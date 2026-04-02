import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RegulatoryAlert, subscribeToAlerts } from '../services/chemService';
import { checkCompliance, RiskReport } from '../services/regulatorService';
import { Radar, AlertTriangle, Info, ShieldAlert, Search, FileText, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

export const RegulatoryRadar: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState<RiskReport | null>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoadingAlerts(true);
    let isFirstLoad = true;
    const unsubscribe = subscribeToAlerts(user.uid, (newAlerts) => {
      // If new alerts appear after initial load, show toast
      if (!isFirstLoad && newAlerts.length > alerts.length) {
        const latestAlert = newAlerts[0];
        if (latestAlert.severity === 'critical' || latestAlert.severity === 'warning') {
          toast.error(
            (t) => (
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-tighter text-white">New Regulatory Match</p>
                  <p className="text-xs text-zinc-muted mt-1">
                    {latestAlert.chemicalName}: {latestAlert.message}
                  </p>
                  <button 
                    onClick={() => toast.dismiss(t.id)}
                    className="mt-2 text-[10px] font-black uppercase tracking-widest text-accent-emerald hover:text-emerald-400"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ),
            { id: `alert-${latestAlert.id}`, duration: 8000 }
          );
        }
      }
      setAlerts(newAlerts);
      setIsLoadingAlerts(false);
      isFirstLoad = false;
    });
    return unsubscribe;
  }, [user, alerts.length]);

  const handleCheckCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientsInput.trim()) return;

    setIsChecking(true);
    try {
      const list = ingredientsInput.split(/[,\n]/).map(i => i.trim()).filter(i => i.length > 0);
      const result = await checkCompliance(list);
      setReport(result);

      if (result.overallStatus === 'Critical' || result.overallStatus === 'Warning') {
        toast.error(
          (t) => (
            <div className="flex items-start gap-4">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tighter text-white">High Priority Alert</p>
                <p className="text-xs text-zinc-muted mt-1">
                  {result.flaggedIngredients} hazardous substances detected in your molecular scan.
                </p>
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  className="mt-2 text-[10px] font-black uppercase tracking-widest text-accent-emerald hover:text-emerald-400"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ),
          { duration: 6000 }
        );
      } else {
        toast.success("Compliance scan completed. No critical risks found.");
      }
    } catch (error) {
      console.error("Compliance check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      case 'warning': return 'border-amber-500/30 bg-amber-500/5';
      default: return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center uppercase">
            <Radar className="w-10 h-10 mr-4 text-accent-emerald emerald-glow" />
            Regulatory Radar
          </h1>
          <p className="text-zinc-muted font-medium">Automated monitoring of global chemical databases (ECHA, EPA, REACH).</p>
        </div>
        <div className="bg-industrial-900 border border-zinc-border rounded-xl px-5 py-3 flex items-center shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse mr-3"></div>
          <span className="text-xs font-black text-white uppercase tracking-widest">Live API Node Active</span>
        </div>
      </header>

      {/* Compliance Checker Section */}
      <section className="glass-panel rounded-3xl p-8 border border-zinc-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-emerald/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent-emerald/10 p-2 rounded-lg border border-accent-emerald/20">
              <Search className="w-5 h-5 text-accent-emerald" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Instant Compliance Scan</h2>
          </div>

          <form onSubmit={handleCheckCompliance} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Ingredients / CAS Numbers</label>
              <textarea
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                placeholder="Enter chemical names or CAS numbers (e.g., Benzene, 71-43-2, Formaldehyde)..."
                className="w-full bg-industrial-950 border border-zinc-border rounded-2xl p-5 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50 focus:border-accent-emerald transition-all font-mono text-sm min-h-[120px] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isChecking || !ingredientsInput.trim()}
              className="bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 font-black px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center uppercase tracking-widest shadow-lg emerald-glow mt-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Analyzing Molecular Data...
                </>
              ) : (
                <>
                  Run Compliance Scan
                  <ArrowRight className="w-4 h-4 ml-3" />
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-10 pt-10 border-t border-zinc-border"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-2xl border shadow-lg",
                      report.overallStatus === 'Critical' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                      report.overallStatus === 'Warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                      "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald"
                    )}>
                      {report.overallStatus === 'Critical' ? <XCircle className="w-8 h-8" /> :
                       report.overallStatus === 'Warning' ? <AlertCircle className="w-8 h-8" /> :
                       <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                        Risk Report: {report.overallStatus}
                      </h3>
                      <p className="text-zinc-muted text-sm font-medium">
                        {report.flaggedIngredients} of {report.totalIngredients} ingredients flagged for review.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-muted uppercase tracking-widest">Scan Timestamp</span>
                    <p className="text-xs text-white font-mono">{new Date(report.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {report.details.length > 0 ? (
                  <div className="grid gap-4">
                    {report.details.map((item, idx) => (
                      <div key={idx} className="bg-industrial-950/50 border border-zinc-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "mt-1 p-1.5 rounded-md",
                            item.status === 'Banned' ? "bg-red-500/20 text-red-500" :
                            item.status === 'Restricted' ? "bg-amber-500/20 text-amber-500" :
                            "bg-blue-500/20 text-blue-500"
                          )}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-bold text-white">{item.ingredient}</h4>
                              <span className="text-[10px] font-mono bg-industrial-800 px-2 py-0.5 rounded text-zinc-muted border border-zinc-border">
                                {item.casNumber}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-muted mb-2">{item.reason}</p>
                            {item.regulations && item.regulations.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.regulations.map((reg, rIdx) => (
                                  <span key={rIdx} className="text-[9px] font-mono bg-industrial-900 px-2 py-0.5 rounded text-accent-emerald border border-accent-emerald/20">
                                    {reg}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-accent-emerald">
                                Agency: {item.agency}
                              </span>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                item.status === 'Banned' ? "bg-red-500/10 text-red-500" :
                                item.status === 'Restricted' ? "bg-amber-500/10 text-amber-500" :
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                Status: {item.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-3">
                          <p className="text-[10px] font-bold text-zinc-muted uppercase text-right max-w-[200px]">
                            {item.recommendation}
                          </p>
                          <Link
                            to={`/substitutions?chemical=${encodeURIComponent(item.ingredient)}`}
                            className="text-xs font-black text-accent-emerald hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2"
                          >
                            Find Substitutes <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-accent-emerald/5 border border-accent-emerald/10 rounded-2xl p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-accent-emerald mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-1">Molecular Compliance Verified</h4>
                    <p className="text-zinc-muted text-sm">No substances from your list were found on global watchlists.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Inventory Alerts Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-accent-emerald/10 p-2 rounded-lg border border-accent-emerald/20">
            <FileText className="w-5 h-5 text-accent-emerald" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Inventory Watchlist Alerts</h2>
        </div>

        <div className="space-y-4">
          {isLoadingAlerts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-industrial-900/50 border border-zinc-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-5 w-full">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-6 w-1/3 rounded-md" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <Skeleton className="h-3 w-1/4 rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 bg-industrial-900/50 border border-zinc-border border-dashed rounded-3xl">
              <Radar className="w-16 h-16 text-industrial-800 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">All Clear</h3>
              <p className="text-zinc-muted max-w-md mx-auto font-medium">
                No regulatory alerts for your current inventory. We are continuously monitoring global databases.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={alert.id}
                className={cn(
                  "border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:border-zinc-border/50",
                  getAlertColor(alert.severity)
                )}
              >
                <div className="flex items-start gap-5">
                  <div className="mt-1">{getAlertIcon(alert.severity)}</div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">
                      {alert.chemicalName}
                    </h3>
                    <p className="text-zinc-muted text-sm leading-relaxed max-w-2xl font-medium">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-zinc-muted mt-3 font-mono uppercase tracking-widest">
                      Detected: {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0">
                  <Link
                    to={`/substitutions?chemical=${encodeURIComponent(alert.chemicalName)}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-industrial-950 hover:bg-industrial-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-border shadow-lg"
                  >
                    Find Substitutes
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
