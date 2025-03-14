"use server"
import axios from "axios";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";


/**
 * Gemini model constants
 */
const GEMINI_FLASH_MODEL = "gemini-2.0-flash"

// eslint-disable-next-line
const GEMINI_PRO_MODEL = "gemini-2.0-pro-exp-02-05"


/**
 * Recursively fetches repository contents while respecting allow/deny lists
 * NOTE: GitHub API has rate limits!
 */
export async function fetchRepoFiles(
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


/**
 * Checks whether the code has safety issue or not.
 */
export async function checkCodeSecurity(repoFileCode: string): Promise<IsSecureType> {
  try {
    const model = new ChatGoogleGenerativeAI({
      model: GEMINI_FLASH_MODEL,
      temperature: 0,
      apiKey: process.env.NEXT_GEMINI_KEY
    });

    const formatInstructions = "Respond with a valid JSON object, containing just these field(s): 'isSecure'";
    const parser = new JsonOutputParser<IsSecureType>();

    const prompt = ChatPromptTemplate.fromTemplate(
      `
      You are the smart code security expert. Your job is to go though the given code and find any vulnerabilities that the developer may have caused in the codebase that could be exploited easily. Please make sure to go thorough the code snippet. If the provided code is not a code and mere text like text from Readme.md file or other text files, the code would be considered as secure. 
      
      Your main focus would be to find vulnerabilites in the code and not to look for typo/
      grammar mistakes/ or any other mistakes that does not cause security risks.

      You will also be provided the code from 'README'/'package.json' or other boiler plate files. In those files do not look for any grammatical or spelling mistake. If the configuration file mentioned above in this sentence really causes an issue due to the code written by the user then only flag it as unsafe. 

      Take gaps to think and analyse the given code.

      The code provided to you would be without the spaces and new lines. What you have to do is consider that the original code snippet would have the spaces and new lines. The code before providing to you was properly formatted.
      
      Only find the vulnerabilities that could be exploited. There are 3 levels of vulnerability for the application: low, medium and high vulnerability. Anything below low would be considered safe to use. Also, the type of 'isSecure' would always be boolean which means either 'true' or 'false'.
      
      Look at the text and reply in the following format:
        {format_instructions}
      The code snippet is: 
        {codeSnippet} 
      `
    );

    const partialedPrompt = await prompt.partial({
      format_instructions: formatInstructions,
    });

    const chain = partialedPrompt.pipe(model).pipe(parser);

    const chainResponse = await chain.invoke({ codeSnippet: `${repoFileCode}` });

    return chainResponse
  } catch (error) {
    console.error("Error in checkCodeSecurity server action")
    console.log(error)
    return {
      isSecure: false
    }
  }
}


/**
  * Use Langchain to get the overview of the text based on the provided code.
 */

export async function scanVulnerability(repoFileCode: string): Promise<VulnerabilityCardContentType> {
  try {
    console.log("REPO FILE CODE 🗒️")
    console.log(repoFileCode)

    const model = new ChatGoogleGenerativeAI({
      model: GEMINI_FLASH_MODEL,
      temperature: 0,
      apiKey: process.env.NEXT_GEMINI_KEY
    });

    const formatInstructions = "Respond with a valid JSON object, containing two fields: 'riskLevel', 'riskTitle','riskDescription', 'isSecure' and 'isCode'";
    const parser = new JsonOutputParser<VulnerabilityCardContentType>();

    const prompt = ChatPromptTemplate.fromTemplate(
      "While looking at the code snippet, do not look at the grammar or correction. Your job is to look for vulnerabilites in the code. If the code snippet is not the code in that case by default the text passed would be considered as secure and you can keep the other fields empty string or anything that goes well with the format instructions. Please make sure that you can leave the description string empty if you think the provided text is not code or the provided text contains the code that has no vulnerability issues. Look at the text and reply in the following format:.\n{format_instructions}\n{codeSnippet}\n"
    );

    const partialedPrompt = await prompt.partial({
      format_instructions: formatInstructions,
    });

    const chain = partialedPrompt.pipe(model).pipe(parser);

    const chainResponse = await chain.invoke({ codeSnippet: repoFileCode });
    console.log(chainResponse)

    return chainResponse

  } catch (error) {
    console.log("Error while getting the scanVulnerability result:")
    console.log(error)
    return {
      riskLevel: "",
      riskTitle: "",
      isSecure: null,
      isCode: true,
      riskDescription: "An error occurred while analyzing the code for vulnerabilities. This could be due to network issues or API limitations. Please try again later."

    }
  }
}
