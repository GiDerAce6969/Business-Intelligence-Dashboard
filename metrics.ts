// src/types/metrics.ts

export interface DepartmentMetrics {
  region: string;
  department_name: string;
  total_transactions: number;
  total_revenue: number;
  total_margin: number;
}

// --- NEW TYPE ---
export interface TimeSeriesMetrics {
  year: number;
  month: number;
  revenue: number;
  margin: number;
}