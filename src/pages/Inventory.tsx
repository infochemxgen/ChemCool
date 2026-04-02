import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { InventoryItem, addInventoryItem, subscribeToInventory, deleteInventoryItem, updateInventoryItem } from '../services/chemService';
import { getComplianceStatus } from '../services/geminiService';
import { 
  Package, Plus, Trash2, ShieldAlert, ShieldCheck, Shield, 
  Upload, Search, Filter, ArrowUpDown, Zap, Loader2, FileText,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { Skeleton } from '../components/ui/Skeleton';

type SortConfig = {
  key: keyof InventoryItem | null;
  direction: 'asc' | 'desc';
};

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chemicalName, setChemicalName] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const unsubscribe = subscribeToInventory(user.uid, (data) => {
      setItems(data);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemicalName.trim() || !user) return;
    
    setIsAdding(true);
    try {
      await addInventoryItem({
        userId: user.uid,
        chemicalName: chemicalName.trim(),
        casNumber: casNumber.trim() || 'N/A',
        quantity: Number(quantity) || 0,
        regulatoryStatus: 'unknown'
      });
      setChemicalName('');
      setCasNumber('');
      setQuantity('');
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const validData = results.data as any[];
        let addedCount = 0;
        
        for (const row of validData) {
          const name = row.chemicalName || row.name || row.Chemical;
          if (name) {
            try {
              await addInventoryItem({
                userId: user.uid,
                chemicalName: name.trim(),
                casNumber: row.casNumber || row.cas || row.CAS || 'N/A',
                quantity: Number(row.quantity || row.qty || row.Amount) || 0,
                regulatoryStatus: 'unknown'
              });
              addedCount++;
            } catch (err) {
              console.error("Error adding CSV row:", err);
            }
          }
        }
        
        if (addedCount === 0) {
          setUploadError("No valid chemical data found in CSV. Ensure columns are named 'chemicalName', 'casNumber', and 'quantity'.");
        }
      },
      error: (error) => {
        setUploadError(`CSV Parsing Error: ${error.message}`);
      }
    });
  };

  const handleScan = async () => {
    if (items.length === 0 || isScanning) return;

    setIsScanning(true);
    try {
      const chemicalNames = items.map(item => item.chemicalName);
      const statuses = await getComplianceStatus(chemicalNames);
      
      for (const status of statuses) {
        const item = items.find(i => i.chemicalName.toLowerCase() === status.chemical.toLowerCase());
        if (item && item.id) {
          // Map Gemini status to InventoryItem status
          let mappedStatus: 'safe' | 'restricted' | 'banned' | 'monitoring' | 'unknown' = 'unknown';
          const s = status.status.toLowerCase();
          if (s === 'safe') mappedStatus = 'safe';
          else if (s === 'restricted') mappedStatus = 'restricted';
          else if (s === 'banned') mappedStatus = 'banned';
          else if (s === 'under review') mappedStatus = 'monitoring';

          await updateInventoryItem(item.id, {
            regulatoryStatus: mappedStatus,
            lastChecked: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error("Scanning failed:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSort = (key: keyof InventoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (searchTerm) {
      result = result.filter(item => 
        item.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.casNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(item => item.regulatoryStatus === statusFilter);
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!] || '';
        const bValue = b[sortConfig.key!] || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, searchTerm, statusFilter, sortConfig]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'banned':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-widest"><ShieldAlert className="w-3 h-3 mr-1" /> Banned</span>;
      case 'restricted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest"><Shield className="w-3 h-3 mr-1" /> Restricted</span>;
      case 'safe':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest"><ShieldCheck className="w-3 h-3 mr-1" /> Safe</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-industrial-800 text-zinc-muted border border-zinc-border uppercase tracking-widest">Unknown</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase flex items-center">
            <Package className="w-10 h-10 mr-4 text-accent-emerald emerald-glow fill-accent-emerald/20" />
            Chemical Inventory
          </h1>
          <p className="text-zinc-muted font-medium">Manage stock and monitor regulatory compliance in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-industrial-900 hover:bg-industrial-800 text-white px-6 py-3 rounded-xl border border-zinc-border transition-all flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
            <Upload className="w-4 h-4" />
            Upload CSV
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button
            onClick={handleScan}
            disabled={isScanning || items.length === 0}
            className="bg-accent-emerald hover:bg-emerald-400 disabled:bg-industrial-800 disabled:text-zinc-muted text-industrial-950 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-black uppercase text-xs tracking-widest emerald-glow"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Scan for Risks
              </>
            )}
          </button>
        </div>
      </header>

      {uploadError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          {uploadError}
        </motion.div>
      )}

      {/* Add Item Panel */}
      <div className="glass-panel rounded-3xl p-8 border border-zinc-border shadow-2xl">
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">Chemical Name</label>
            <input
              type="text"
              value={chemicalName}
              onChange={(e) => setChemicalName(e.target.value)}
              placeholder="e.g., Benzene, X-42"
              className="w-full bg-industrial-950 border border-zinc-border rounded-xl px-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
              disabled={isAdding}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest ml-1">CAS Number</label>
            <input
              type="text"
              value={casNumber}
              onChange={(e) => setCasNumber(e.target.value)}
              placeholder="e.g., 71-43-2"
              className="w-full bg-industrial-950 border border-zinc-border rounded-xl px-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
              disabled={isAdding}
            />
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <div className="flex gap-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty (kg)"
                className="w-24 bg-industrial-950 border border-zinc-border rounded-xl px-4 py-3 text-white placeholder-zinc-muted focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
                disabled={isAdding}
              />
              <button
                type="submit"
                disabled={isAdding || !chemicalName.trim()}
                className="flex-1 bg-industrial-800 hover:bg-industrial-700 text-white font-black rounded-xl transition-all flex items-center justify-center border border-zinc-border uppercase text-xs tracking-widest"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-industrial-900/50 p-4 rounded-2xl border border-zinc-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory..."
            className="w-full bg-industrial-950 border border-zinc-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-emerald/50"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-industrial-950 border border-zinc-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="safe">Safe</option>
              <option value="restricted">Restricted</option>
              <option value="banned">Banned</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-industrial-900 border border-zinc-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-industrial-950 text-[10px] font-black text-zinc-muted uppercase tracking-widest border-b border-zinc-border">
              <tr>
                <th className="px-8 py-5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('chemicalName')}>
                  <div className="flex items-center gap-2">
                    Chemical Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('casNumber')}>
                  <div className="flex items-center gap-2">
                    CAS Number
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-8 py-5 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center gap-2">
                    Quantity
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-8 py-5">Regulatory Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-border/50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-industrial-950/50 transition-colors">
                      <td className="px-8 py-5"><Skeleton className="h-6 w-3/4 rounded-md" /></td>
                      <td className="px-8 py-5"><Skeleton className="h-6 w-1/2 rounded-md" /></td>
                      <td className="px-8 py-5"><Skeleton className="h-6 w-1/4 rounded-md" /></td>
                      <td className="px-8 py-5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-8 py-5 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredAndSortedItems.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <FileText className="w-12 h-12 text-industrial-800" />
                        <p className="text-zinc-muted font-medium">No chemicals found in inventory.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredAndSortedItems.map((item) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.id} 
                      className="hover:bg-industrial-950/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-white uppercase tracking-tight">{item.chemicalName}</div>
                      </td>
                      <td className="px-8 py-5">
                        <code className="text-xs font-mono text-zinc-muted bg-industrial-950 px-2 py-1 rounded border border-zinc-border/30">
                          {item.casNumber}
                        </code>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-white">{item.quantity}</span>
                        <span className="text-[10px] text-zinc-muted ml-1 uppercase font-black">kg</span>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(item.regulatoryStatus)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => item.id && deleteInventoryItem(item.id)}
                          className="text-zinc-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
