"use client";

import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import fetchRepoFiles from "../actions";

export default function Page() {
  const params = useParams<{ slug: Array<string> }>();
  const { slug } = params;

  const [owner, repo] = slug;
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFiles() {
      const files: CodeSnippet[] = await fetchRepoFiles(owner, repo);
      setCodeSnippets(files.map((file) => ({ ...file, isOpen: false })));
      setLoading(false);
    }
    loadFiles();
  }, [owner, repo]);

  const toggleSnippet = (index: number) => {
    setCodeSnippets((prev) =>
      prev.map((snippet, i) =>
        i === index ? { ...snippet, isOpen: !snippet.isOpen } : snippet
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8 border-b pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-medium text-gray-900">
            <span className="font-mono text-gray-600">{owner}</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="font-semibold text-gray-800">{repo}</span>
          </h1>
          <span className="text-sm text-gray-400">Code Analysis</span>
        </div>
        <p className="mt-2 text-gray-500 text-sm">
          Public repository security audit report
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : codeSnippets.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-xl flex flex-col items-center">
          <div className="text-gray-300 mb-3 text-4xl">ⓘ</div>
          <p className="text-gray-400 font-medium">No code files found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codeSnippets.map((snippet, index) => (
            <div
              key={index}
              className="group bg-white rounded-lg border transition-all hover:border-gray-300"
            >
              <button
                onClick={() => toggleSnippet(index)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                    <span className="text-sm">📄</span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-800 text-sm">
                      {snippet.name.split('/').pop()}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-1">
                      {snippet.name}
                    </div>
                  </div>
                </div>
                {snippet.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {snippet.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <div className="border-t">
                      <SyntaxHighlighter
                        language={snippet.language || "plaintext"}
                        style={atomOneLight}
                        className="p-4 text-sm !font-mono !bg-gray-50"
                        showLineNumbers
                        wrapLongLines
                        lineNumberStyle={{ color: "#9CA3AF" }}
                      >
                        {snippet.content}
                      </SyntaxHighlighter>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}
