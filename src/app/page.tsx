"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, GithubIcon } from "lucide-react";
import { GridBackground } from "@/components/ui/grid-background";

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.startsWith("https://github.com/")) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    // Extract repo name from URL
    const repoPath = repoUrl.replace("https://github.com/", "");

    // Validate that we have both username and repository
    if (!repoPath) {
      setError("Invalid repository URL format");
      return;
    }

    setError("");
    window.location.href = `/${repoPath}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-indigo-100/60" />
      {/* Grid Background */}
      <GridBackground />
      <div className="absolute inset-0 bg-[radial-gradient(at_center_40%_20%,#6366f115_0%,transparent_70%)]" />
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-soft-light filter blur-[120px] opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-soft-light filter blur-[120px] opacity-40" />

      <div className="relative z-20 w-full max-w-lg space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            Git Guardian
            <span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Analyze vulnerabilities in a public GitHub repository
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-center bg-white/95 backdrop-blur-lg rounded-xl shadow-xl ring-2 ring-slate-200/50 focus-within:ring-slate-300 transition-all">
            <GithubIcon className="h-5 w-5 text-slate-400 ml-4" />
            <Input
              type="text"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              autoFocus={true}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 py-5 px-4 text-base placeholder-slate-400 text-slate-900"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-indigo-600 text-white rounded-xl m-1.5 hover:bg-indigo-700 transition-colors"
              disabled={!repoUrl}
            >
              <ArrowRight size={20} />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50/80 px-4 py-2.5 rounded-lg backdrop-blur-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
