/**
 * Centralised API layer — all HTTP calls go through this module.
 * Swap NEXT_PUBLIC_API_URL (or VITE_API_URL) for the real Flask endpoint.
 * Mock responses are returned when no backend is available.
 */

import axios from "axios";
import type {
  AnalysisResult,
  DashboardStats,
  DamageDistribution,
  FrequencyDataPoint,
  PriorityDistribution,
  CriticalCase,
} from "../types";

// ─── Axios instance ──────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Mock helpers ─────────────────────────────────────────────────────────────

/** Simulate network latency */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Detection API ────────────────────────────────────────────────────────────

/**
 * Upload an image for detection + risk prediction.
 * Returns a mock response that mirrors the real Flask contract.
 */
export async function analyzeImage(file: File): Promise<AnalysisResult> {
  // In production: uncomment the axios call below and remove the mock block
  //
  // const form = new FormData();
  // form.append("image", file);
  // const { data } = await apiClient.post<AnalysisResult>("/analyze", form, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  // return data;

  await delay(2200); // simulate inference time

  const original_url = URL.createObjectURL(file);

  return {
    original_url,
    image_url: original_url, // production: server returns annotated image URL
    detections: [
      { type: "pothole", confidence: 0.92 },
      { type: "pothole", confidence: 0.88 },
      { type: "crack",   confidence: 0.79 },
      { type: "pothole", confidence: 0.71 },
      { type: "crack",   confidence: 0.65 },
    ],
    features: {
      pothole_count: 3,
      crack_count:   2,
      damage_area:   0.42,
      rutting_count: 0,
      erosion_count: 0,
    },
    prediction: {
      priority:   "High",
      risk_score: 0.87,
      reason:
        "Multiple potholes detected alongside significant cracking. Combined damage area of 42 % signals structural degradation requiring urgent intervention.",
    },
  };
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  // return data;
  await delay(800);
  return {
    total_analyzed:      1_284,
    most_common_damage:  "crack",
    high_priority_count: 318,
    average_risk_score:  0.61,
  };
}

export async function fetchDamageDistribution(): Promise<DamageDistribution[]> {
  await delay(600);
  return [
    { name: "Pothole",  value: 387, color: "#EF4444" },
    { name: "Crack",    value: 521, color: "#F97316" },
    { name: "Rutting",  value: 198, color: "#EAB308" },
    { name: "Erosion",  value: 112, color: "#22D3EE" },
    { name: "Patch",    value:  66, color: "#3B82F6" },
  ];
}

export async function fetchFrequencyData(): Promise<FrequencyDataPoint[]> {
  await delay(700);
  return [
    { date: "Jan", count: 68 },
    { date: "Feb", count: 92 },
    { date: "Mar", count: 115 },
    { date: "Apr", count: 87 },
    { date: "May", count: 134 },
    { date: "Jun", count: 156 },
    { date: "Jul", count: 142 },
    { date: "Aug", count: 178 },
    { date: "Sep", count: 121 },
    { date: "Oct", count: 99 },
    { date: "Nov", count: 143 },
    { date: "Dec", count: 169 },
  ];
}

export async function fetchPriorityDistribution(): Promise<PriorityDistribution[]> {
  await delay(650);
  return [
    { priority: "Very High", count: 124, color: "#EF4444" },
    { priority: "High",      count: 319, color: "#F97316" },
    { priority: "Medium",    count: 487, color: "#EAB308" },
    { priority: "Low",       count: 354, color: "#22C55E" },
  ];
}

export async function fetchCriticalCases(): Promise<CriticalCase[]> {
  await delay(900);
  return [
    {
      id:          "CC-001",
      location:    "Main Street & 5th Ave",
      priority:    "Very High",
      risk_score:  0.97,
      damage_types: ["pothole", "crack", "rutting"],
      timestamp:   "2025-06-10T08:23:00Z",
    },
    {
      id:          "CC-002",
      location:    "Highway 44 North Ramp",
      priority:    "Very High",
      risk_score:  0.93,
      damage_types: ["pothole", "erosion"],
      timestamp:   "2025-06-09T14:10:00Z",
    },
    {
      id:          "CC-003",
      location:    "Industrial Blvd km 7.3",
      priority:    "High",
      risk_score:  0.85,
      damage_types: ["crack", "rutting"],
      timestamp:   "2025-06-08T11:05:00Z",
    },
    {
      id:          "CC-004",
      location:    "Riverside Drive Bridge Approach",
      priority:    "High",
      risk_score:  0.81,
      damage_types: ["pothole", "crack"],
      timestamp:   "2025-06-07T09:45:00Z",
    },
    {
      id:          "CC-005",
      location:    "Airport Access Road",
      priority:    "High",
      risk_score:  0.78,
      damage_types: ["crack", "patch"],
      timestamp:   "2025-06-06T16:30:00Z",
    },
  ];
}
