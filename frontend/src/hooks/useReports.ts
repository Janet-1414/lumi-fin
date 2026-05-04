"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export function useReports(period: string = "month") {
  const [report, setReport] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<any>("/reports", { period });
        setReport(data);
      } catch (e: any) {
        toast.error(e.message || "Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [period]);

  const fetchAiSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const data = await api.get<{ ai_summary: string }>("/reports/ai-summary", { period });
      setAiSummary(data.ai_summary);
    } catch (e: any) {
      toast.error("AI summary unavailable — upgrade to Lumi Pro");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return { report, aiSummary, isLoading, isSummaryLoading, fetchAiSummary };
}
