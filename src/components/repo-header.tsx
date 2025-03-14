// The header to be shown on the page where the repo scanning is happening.

import { HomeIcon } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

function RepoHeader({ owner, repo }: { owner: string; repo: string }) {
  return (
    <header className="mb-8 border-b pb-6  flex items-center gap-10 max-w-7xl mx-auto">
      <Link href={"/"}>
        <Button variant={"outline"} className="cursor-pointer">
          <HomeIcon className=" text-gray-600" />
        </Button>
      </Link>
      <div>
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
      </div>
    </header>
  );
}

export default RepoHeader;
