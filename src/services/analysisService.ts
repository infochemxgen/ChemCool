import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export interface ChemicalAnalysis {
  id?: string;
  userId: string;
  compoundName: string;
  formula?: string;
  molecularWeight?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt?: string;
}

export const createAnalysis = async (analysis: ChemicalAnalysis) => {
  try {
    const docRef = await addDoc(collection(db, 'analyses'), {
      ...analysis,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'analyses');
    throw error;
  }
};

export const deleteAnalysis = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'analyses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `analyses/${id}`);
    throw error;
  }
};

export const updateAnalysis = async (id: string, data: Partial<ChemicalAnalysis>) => {
  try {
    await updateDoc(doc(db, 'analyses', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `analyses/${id}`);
    throw error;
  }
};

export const subscribeToAnalyses = (userId: string, callback: (analyses: ChemicalAnalysis[]) => void) => {
  const q = query(collection(db, 'analyses'), where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const analyses: ChemicalAnalysis[] = [];
    snapshot.forEach((doc) => {
      analyses.push({ id: doc.id, ...doc.data() } as ChemicalAnalysis);
    });
    // Sort by createdAt descending
    analyses.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    callback(analyses);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'analyses');
  });
};
