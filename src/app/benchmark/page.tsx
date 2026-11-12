import type { Metadata } from "next";
import { BenchmarkContent } from "@/components/benchmark/BenchmarkContent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "@/styles/benchmark.css";

export const metadata: Metadata = {
  title: "Benchmark",
  description:
    "How fast Vythea starts, streams and resumes, and how it scores on SWE-bench and Harness-Bench.",
};

export default function BenchmarkPage() {
  return (
    <>
      <BenchmarkContent />
      <SiteFooter />
    </>
  );
}
