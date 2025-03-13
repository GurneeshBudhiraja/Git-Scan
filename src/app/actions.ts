"use server"
import axios from "axios";


/**
 * Recursively fetches repository contents while respecting allow/deny lists
 * NOTE: GitHub API has rate limits!
 */
export default async function fetchRepoFiles(
  owner: string,
  repo: string,
  path: string = ""
): Promise<Array<CodeSnippet>> {
  try {
    // Files we actually want to show in our analysis
    const ALLOWED_FILES = [
      // Code files (extensions matter)
      /\.(js|ts|py|jsx|tsx|mjs|cjs)$/i, // Common script files
      /\.(java|php|rb|go|rs)$/i, // Additional languages

      // Config files (both named and extensions)
      /^dockerfile$/i, // Docker configuration
      /\.(env|config|conf|ini|xml|yaml|yml)$/i, // Common config formats
      /^(package\.json|tsconfig\.json|.*config\.js)$/i, // Node.js configs

      /\.(md|txt)$/i, // Readmes and docs

      /^(makefile|gradle|build\.gradle)$/i, // Build automation
    ];

    // Files and paths we want to explicitly ignore
    const IGNORED_FILES = [
      /node_modules/, // No need to analyze dependencies
      /\.gitignore/, // Not useful for code analysis
      /package-lock\.json|yarn\.lock/, // Lock files
      /\.DS_Store/, // macOS cruft
      /(dist|build|coverage)\//, // Build/output directories
      /\.(spec|test)\.[jt]s$/, // Test files (optional exclusion)
    ];

    const apiUrl = `${process.env.NEXT_GITHUB_API}/${owner}/${repo}/contents/${path}`;

    // Get initial directory listing
    const { data: items } = await axios.get<any[]>(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Authentication Token for higher rate limits
        Authorization: `token ${process.env.NEXT_GITHUB_TOKEN}`,
      },
    });

    const codeSnippets: CodeSnippet[] = [];
    const processItems = await Promise.all(
      items.map(async (item) => {
        try {
          if (item.type === "dir") {
            // RECURSION: Process directories by their full path
            const dirContents = await fetchRepoFiles(
              owner,
              repo,
              item.path
            );
            return dirContents;
          } else if (item.type === "file") {
            // Validate against our pattern lists
            const isAllowed = ALLOWED_FILES.some((p) => p.test(item.name));
            const isIgnored = IGNORED_FILES.some((p) => p.test(item.path));

            if (isAllowed && !isIgnored) {
              // Fetch raw file content
              const { data } = await axios.get<string>(item.download_url, {
                transformResponse: [(v) => v], // Keep as raw string
              });

              return [
                {
                  name: item.path,
                  content: data,
                  language: item.name.split(".").pop()?.toLowerCase() || "text",
                },
              ];
            }
          }
          return [];
        } catch (error) {
          console.error(`⚠️ Failed to process ${item.path}:`, error);
          return [];
        }
      })
    );

    // Flatten nested arrays from directory processing
    return codeSnippets.concat(...processItems);
  } catch (error) {
    console.error("🚨 Critical error fetching directory:", error);
    return [];
  }
}