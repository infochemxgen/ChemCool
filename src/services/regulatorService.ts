/**
 * Regulatory Radar Service
 * Simulates fetching data from global chemical watchlists (ECHA, EPA, REACH)
 * and provides compliance checking logic.
 */

import { getComplianceStatus } from './geminiService';

export interface WatchlistEntry {
  casNumber: string;
  name: string;
  agency: string;
  status: 'Banned' | 'Restricted' | 'Under Review' | 'Safe';
  reason: string;
  effectiveDate: string;
}

export interface RiskReport {
  timestamp: string;
  totalIngredients: number;
  flaggedIngredients: number;
  overallStatus: 'Compliant' | 'Warning' | 'Critical';
  details: {
    ingredient: string;
    casNumber: string;
    status: 'Banned' | 'Restricted' | 'Under Review';
    agency: string;
    reason: string;
    recommendation: string;
    regulations: string[];
  }[];
}

// ... (MOCK_WATCHLIST and fetchWatchlists can stay for now or be removed if not used elsewhere)

/**
 * Compares a list of ingredients against global watchlists using Gemini AI.
 * @param ingredientsList Array of chemical names or CAS numbers
 */
export const checkCompliance = async (ingredientsList: string[]): Promise<RiskReport> => {
  try {
    const complianceResults = await getComplianceStatus(ingredientsList);
    
    const details: RiskReport['details'] = complianceResults
      .filter(res => res.status !== 'Safe')
      .map(res => ({
        ingredient: res.chemical,
        casNumber: res.casNumber,
        status: res.status as 'Banned' | 'Restricted' | 'Under Review',
        agency: res.agency,
        reason: res.reason,
        recommendation: res.recommendation,
        regulations: res.regulations
      }));

    const flaggedCount = details.length;
    const hasBanned = details.some(d => d.status === 'Banned');
    
    let overallStatus: RiskReport['overallStatus'] = 'Compliant';
    if (hasBanned) {
      overallStatus = 'Critical';
    } else if (flaggedCount > 0) {
      overallStatus = 'Warning';
    }

    return {
      timestamp: new Date().toISOString(),
      totalIngredients: ingredientsList.length,
      flaggedIngredients: flaggedCount,
      overallStatus,
      details
    };
  } catch (error) {
    console.error("Error in AI compliance check:", error);
    throw error;
  }
};
