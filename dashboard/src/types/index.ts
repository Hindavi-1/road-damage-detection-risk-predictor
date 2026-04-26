/**
 * Central type definitions for the Road Damage Detection & Risk Assessment System
 */

// ─── Detection Types ────────────────────────────────────────────────────────

export interface Detection {
  type: DamageType;
  confidence: number;
  bbox?: [number, number, number, number]; // [x, y, width, height] normalised 0-1
}

export type DamageType = "pothole" | "crack" | "rutting" | "erosion" | "patch" | "other";

export type PriorityLevel = "Very High" | "High" | "Medium" | "Low";

// ─── Feature Extraction ──────────────────────────────────────────────────────

export interface ExtractedFeatures {
  pothole_count: number;
  crack_count: number;
  damage_area: number;       // 0–1 percentage of image
  rutting_count?: number;
  erosion_count?: number;
}

// ─── Risk Prediction ─────────────────────────────────────────────────────────

export interface RiskPrediction {
  priority: PriorityLevel;
  risk_score: number;        // 0–1
  reason: string;
}

// ─── Full API Response ────────────────────────────────────────────────────────

export interface AnalysisResult {
  detections: Detection[];
  features: ExtractedFeatures;
  prediction: RiskPrediction;
  image_url: string;         // URL / base64 of the processed (annotated) image
  original_url?: string;     // URL / base64 of the original uploaded image
}

// ─── Dashboard / Analytics ───────────────────────────────────────────────────

export interface DashboardStats {
  total_analyzed: number;
  most_common_damage: DamageType;
  high_priority_count: number;
  average_risk_score: number;
}

export interface DamageDistribution {
  name: string;
  value: number;
  color: string;
}

export interface FrequencyDataPoint {
  date: string;
  count: number;
}

export interface PriorityDistribution {
  priority: PriorityLevel;
  count: number;
  color: string;
}

export interface CriticalCase {
  id: string;
  location: string;
  priority: PriorityLevel;
  risk_score: number;
  damage_types: DamageType[];
  timestamp: string;
}

// ─── Dataset Page ─────────────────────────────────────────────────────────────

export interface ClassDistribution {
  label: string;
  count: number;
  color: string;
}

export interface SampleImage {
  id: string;
  url: string;
  label: DamageType;
  split: "train" | "val" | "test";
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string; // lucide icon name
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";
