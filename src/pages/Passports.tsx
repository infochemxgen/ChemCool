import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProductPassport, generatePassport, subscribeToPassports, InventoryItem, subscribeToInventory, BOMItem } from '../services/chemService';
import { QrCode, ShieldCheck, FileText, Plus, Trash2, Download, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '../components/ui/Skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Passports: React.FC = () => {
  const { user } = useAuth();
  const [passports, setPassports] = useState<ProductPassport[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedChemical, setSelectedChemical] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [bom, setBom] = useState<BOMItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // BOM Item Form State
  const [newIngredient, setNewIngredient] = useState('');
  const [newCas, setNewCas] = useState('');
  const [newPercentage, setNewPercentage] = useState(0);
  const [newBio, setNewBio] = useState(50);
  const [newTox, setNewTox] = useState(50);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsubPassports = subscribeToPassports(user.uid, (data) => {
      setPassports(data);
      setIsLoading(false);
    });
    const unsubInventory = subscribeToInventory(user.uid, setInventory);
    
    return () => {
      unsubPassports();
      unsubInventory();
    };
  }, [user]);

  const circularityScore = useMemo(() => {
    if (bom.length === 0) return 0;
    const totalWeight = bom.reduce((sum, item) => sum + item.percentage, 0);
    if (totalWeight === 0) return 0;

    const weightedBio = bom.reduce((sum, item) => sum + (item.biodegradability * (item.percentage / totalWeight)), 0);
    const weightedTox = bom.reduce((sum, item) => sum + (item.toxicity * (item.percentage / totalWeight)), 0);

    // Score = 60% Bio + 40% (100 - Tox)
    return Math.round((weightedBio * 0.6) + ((100 - weightedTox) * 0.4));
  }, [bom]);

  const addBomItem = () => {
    if (!newIngredient || !newCas) return;
    setBom([...bom, {
      ingredient: newIngredient,
      casNumber: newCas,
      percentage: newPercentage,
      biodegradability: newBio,
      toxicity: newTox
    }]);
    setNewIngredient('');
    setNewCas('');
    setNewPercentage(0);
    setNewBio(50);
    setNewTox(50);
  };

  const removeBomItem = (index: number) => {
    setBom(bom.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChemical || !batchNumber.trim() || !user || bom.length === 0) return;
    
    const chemical = inventory.find(i => i.id === selectedChemical);
    if (!chemical) return;

    setIsGenerating(true);
    try {
      await generatePassport(
        user.uid,
        chemical.id!,
        chemical.chemicalName,
        batchNumber.trim(),
        bom,
        circularityScore
      );
      setSelectedChemical('');
      setBatchNumber('');
      setBom([]);
    } catch (error) {
      console.error("Failed to generate passport:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (passport: ProductPassport) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('DIGITAL PRODUCT PASSPORT', 105, 25, { align: 'center' });
    
    // Body
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`Product: ${passport.chemicalName}`, 20, 55);
    doc.text(`Batch Number: ${passport.batchNumber}`, 20, 65);
    doc.text(`Verification Hash: ${passport.verificationHash}`, 20, 75);
    doc.text(`Generated Date: ${new Date(passport.createdAt!).toLocaleDateString()}`, 20, 85);
    
    // Circularity Score
    doc.setFontSize(16);
    doc.text(`Circularity Score: ${passport.circularityScore}/100`, 20, 105);
    
    // BOM Table
    autoTable(doc, {
      startY: 115,
      head: [['Ingredient', 'CAS Number', 'Percentage', 'Bio-degradability', 'Toxicity']],
      body: passport.bom.map(item => [
        item.ingredient,
        item.casNumber,
        `${item.percentage}%`,
        `${item.biodegradability}%`,
        `${item.toxicity}%`
      ]),
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Verified by CHEMXGEN Blockchain Node', 105, 285, { align: 'center' });
    
    doc.save(`DPP-${passport.batchNumber}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 flex items-center uppercase">
          <QrCode className="w-10 h-10 mr-4 text-accent-emerald emerald-glow" />
          Digital Product Passports
        </h1>
        <p className="text-zinc-muted font-medium">Generate blockchain-verified digital twins for regulatory compliance and export.</p>
      </header>

      {/* Generator Form */}
      <div className="glass-panel rounded-3xl p-8 border border-zinc-border mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-emerald/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-white mb-6 flex items-center uppercase tracking-tight">
            <FileText className="w-5 h-5 mr-3 text-accent-emerald" />
            Passport Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Base Chemical</label>
              {isLoading ? (
                <Skeleton className="w-full h-12 rounded-xl" />
              ) : (
                <select
                  value={selectedChemical}
                  onChange={(e) => setSelectedChemical(e.target.value)}
                  className="w-full bg-industrial-950 border border-zinc-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
                  disabled={isGenerating || inventory.length === 0}
                  required
                >
                  <option value="" disabled>Select from Inventory</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.chemicalName} ({item.casNumber})</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Batch Identifier</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., BATCH-2026-04"
                className="w-full bg-industrial-950 border border-zinc-border rounded-xl px-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
                disabled={isGenerating}
                required
              />
            </div>
          </div>

          {/* BOM Section */}
          <div className="bg-industrial-950/50 border border-zinc-border rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center">
              <Leaf className="w-4 h-4 mr-2 text-accent-emerald" />
              Bill of Materials (BOM)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <input
                type="text"
                placeholder="Ingredient"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                className="bg-industrial-900 border border-zinc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="CAS #"
                value={newCas}
                onChange={(e) => setNewCas(e.target.value)}
                className="bg-industrial-900 border border-zinc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="number"
                placeholder="%"
                value={newPercentage}
                onChange={(e) => setNewPercentage(Number(e.target.value))}
                className="bg-industrial-900 border border-zinc-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-zinc-muted uppercase font-bold">Bio: {newBio}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newBio}
                  onChange={(e) => setNewBio(Number(e.target.value))}
                  className="accent-accent-emerald"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-zinc-muted uppercase font-bold">Tox: {newTox}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newTox}
                  onChange={(e) => setNewTox(Number(e.target.value))}
                  className="accent-red-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addBomItem}
              className="w-full py-2 border border-dashed border-zinc-border rounded-lg text-[10px] font-black text-zinc-muted hover:text-white hover:border-zinc-muted transition-all uppercase tracking-widest"
            >
              Add Ingredient to BOM
            </button>

            {bom.length > 0 && (
              <div className="mt-6 space-y-2">
                {bom.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-industrial-900 p-3 rounded-xl border border-zinc-border/50">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-white">{item.ingredient}</span>
                      <span className="text-[10px] font-mono text-zinc-muted">{item.casNumber}</span>
                      <span className="text-[10px] font-black text-accent-emerald">{item.percentage}%</span>
                    </div>
                    <button onClick={() => removeBomItem(idx)} className="text-zinc-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-border">
            <div className="flex items-center gap-4">
              <div className="bg-accent-emerald/10 p-4 rounded-2xl border border-accent-emerald/20">
                <div className="text-[10px] font-black text-accent-emerald uppercase tracking-widest mb-1">Circularity Score</div>
                <div className="text-3xl font-black text-white">{circularityScore}<span className="text-sm text-zinc-muted">/100</span></div>
              </div>
              <div className="max-w-[200px]">
                <p className="text-[10px] text-zinc-muted font-medium leading-tight">
                  Calculated based on weighted average of biodegradability and toxicity profiles of the BOM.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedChemical || !batchNumber.trim() || bom.length === 0}
              className="bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 font-black px-10 py-4 rounded-xl transition-all duration-300 flex items-center justify-center uppercase tracking-widest shadow-lg emerald-glow"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-3" />
              )}
              Generate Blockchain Passport
            </button>
          </div>
        </div>
      </div>

      {/* Passports List */}
      <div className="grid md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-industrial-900 border border-zinc-border rounded-3xl p-8 flex flex-col gap-6">
                <div className="flex gap-6">
                  <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-7 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-10 w-16 rounded-md" />
                      <Skeleton className="h-10 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                </div>
              </div>
            ))
          ) : passports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-2 text-center py-24 bg-industrial-900/50 border border-zinc-border border-dashed rounded-3xl"
            >
              <QrCode className="w-16 h-16 text-industrial-800 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">No Passports Generated</h3>
              <p className="text-zinc-muted max-w-md mx-auto font-medium">
                Create your first Digital Product Passport to ensure compliance for your chemical batches.
              </p>
            </motion.div>
          ) : (
            passports.map((passport, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                key={passport.id}
                className="bg-industrial-900 border border-zinc-border rounded-3xl p-8 flex flex-col gap-6 hover:border-accent-emerald/30 transition-all group relative overflow-hidden"
              >
              <div className="flex gap-6">
                <div className="shrink-0 bg-white p-3 rounded-2xl shadow-xl">
                  <QRCodeSVG 
                    value={`https://chemxgen.com/verify/${passport.verificationHash}`} 
                    size={100} 
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-white truncate uppercase tracking-tight">{passport.chemicalName}</h3>
                    <ShieldCheck className="w-6 h-6 text-accent-emerald shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-muted mb-4 font-mono font-bold">BATCH ID: {passport.batchNumber}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-muted uppercase tracking-widest">Circularity</span>
                      <span className="text-lg font-black text-white">{passport.circularityScore}%</span>
                    </div>
                    <div className="w-px h-8 bg-zinc-border"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-muted uppercase tracking-widest">Status</span>
                      <span className="text-[10px] font-black text-accent-emerald uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] text-zinc-muted">
                  <span className="block mb-1 font-bold uppercase tracking-widest">Verification Hash</span>
                  <span className="font-mono bg-industrial-950 px-3 py-2 rounded-xl text-zinc-muted block truncate border border-zinc-border/30">
                    {passport.verificationHash}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-zinc-border/50">
                  <span className="text-[10px] text-zinc-muted font-mono">
                    {passport.createdAt ? new Date(passport.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                  <button
                    onClick={() => downloadPDF(passport)}
                    className="flex items-center gap-2 text-[10px] font-black text-accent-emerald hover:text-emerald-400 uppercase tracking-widest transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Report
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Loader2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
