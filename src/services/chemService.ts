import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface InventoryItem {
  id?: string;
  userId: string;
  chemicalName: string;
  casNumber: string;
  regulatoryStatus: 'safe' | 'restricted' | 'banned' | 'monitoring' | 'unknown';
  quantity: number;
  createdAt?: string;
  lastChecked?: string;
}

export interface RegulatoryAlert {
  id?: string;
  userId: string;
  chemicalId: string;
  chemicalName: string;
  message: string;
  severity: 'warning' | 'critical' | 'info';
  createdAt?: string;
}

export interface BOMItem {
  ingredient: string;
  casNumber: string;
  percentage: number;
  biodegradability: number; // 0-100
  toxicity: number; // 0-100
}

export interface ProductPassport {
  id?: string;
  userId: string;
  chemicalId: string;
  chemicalName: string;
  batchNumber: string;
  verificationHash: string;
  bom: BOMItem[];
  circularityScore: number;
  createdAt?: string;
}

export interface SubstitutionOption {
  name: string;
  casNumber: string;
  matchPercentage: number;
  properties: {
    boilingPoint: string;
    toxicity: string;
    costImpact: string;
  };
}

// --- INVENTORY ---

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'inventory'), {
      ...item,
      createdAt: new Date().toISOString(),
    });

    // Automatically generate an alert if restricted or banned
    if (item.regulatoryStatus === 'banned') {
      await addDoc(collection(db, 'alerts'), {
        userId: item.userId,
        chemicalId: docRef.id,
        chemicalName: item.chemicalName,
        message: `Warning: Ingredient ${item.chemicalName} was banned in California this morning. You have 6 months to comply.`,
        severity: 'critical',
        createdAt: new Date().toISOString(),
      });
    } else if (item.regulatoryStatus === 'restricted') {
      await addDoc(collection(db, 'alerts'), {
        userId: item.userId,
        chemicalId: docRef.id,
        chemicalName: item.chemicalName,
        message: `Notice: ${item.chemicalName} has been added to the ECHA restricted monitoring list. Usage limits apply.`,
        severity: 'warning',
        createdAt: new Date().toISOString(),
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'inventory');
    throw error;
  }
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
  try {
    const docRef = doc(db, 'inventory', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inventory/${id}`);
    throw error;
  }
};

export const subscribeToInventory = (userId: string, callback: (items: InventoryItem[]) => void) => {
  const q = query(collection(db, 'inventory'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'inventory');
  });
};

export const deleteInventoryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'inventory', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
    throw error;
  }
};

// --- ALERTS ---

export const subscribeToAlerts = (userId: string, callback: (alerts: RegulatoryAlert[]) => void) => {
  const q = query(collection(db, 'alerts'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegulatoryAlert));
    alerts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(alerts);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'alerts');
  });
};

// --- SUBSTITUTION ENGINE (MOCK API) ---

export const findSubstitutions = async (chemicalName: string): Promise<SubstitutionOption[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock "Next-Gen" alternatives
  return [
    {
      name: `Eco-${chemicalName.split('-')[0] || 'Chem'} Gen-2`,
      casNumber: '10293-44-X',
      matchPercentage: 94,
      properties: {
        boilingPoint: 'Similar (±2°C)',
        toxicity: 'Non-toxic (EPA Safe Choice)',
        costImpact: '+12% per kg',
      }
    },
    {
      name: `BioSynth ${chemicalName.substring(0, 3).toUpperCase()}-Alpha`,
      casNumber: '99210-22-1',
      matchPercentage: 88,
      properties: {
        boilingPoint: 'Lower (-15°C)',
        toxicity: 'Biodegradable',
        costImpact: '-5% per kg',
      }
    }
  ];
};

// --- DIGITAL PRODUCT PASSPORTS ---

export const generatePassport = async (
  userId: string, 
  chemicalId: string, 
  chemicalName: string, 
  batchNumber: string,
  bom: BOMItem[],
  circularityScore: number
) => {
  try {
    // Simulate Blockchain Verification Hash
    const hash = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const docRef = await addDoc(collection(db, 'passports'), {
      userId,
      chemicalId,
      chemicalName,
      batchNumber,
      verificationHash: hash,
      bom,
      circularityScore,
      createdAt: new Date().toISOString(),
    });
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'passports');
    throw error;
  }
};

export const subscribeToPassports = (userId: string, callback: (passports: ProductPassport[]) => void) => {
  const q = query(collection(db, 'passports'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const passports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductPassport));
    passports.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    callback(passports);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'passports');
  });
};
