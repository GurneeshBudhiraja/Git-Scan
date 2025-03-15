"use server"
import axios from "axios";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";


/**
 * Gemini model constants
 */
const GEMINI_FLASH_MODEL = "gemini-2.0-flash"
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
export async function checkCodeSecurity(code: string): Promise<IsSecureType> {
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

    const chainResponse = await chain.invoke({ codeSnippet: `${code}` });

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
export async function scanVulnerability(code: string): Promise<VulnerabilityCardProps> {
  try {
    const model = new ChatGoogleGenerativeAI({
      model: GEMINI_PRO_MODEL,
      temperature: 0,
      apiKey: process.env.NEXT_GEMINI_KEY
    });

    const formatInstructions = "Respond with a valid JSON object, containing the below fields: 'riskLevel', 'riskTitle', 'riskDescription', 'setOpenCard', 'correctCode', 'vulnerabilityCardLoading'.";

    const parser = new JsonOutputParser<VulnerabilityCardProps>();

    const prompt = ChatPromptTemplate.fromTemplate(

      ` 
      You are a helpful agent which has a great speciality in finding vulnerabilites in the code. There are 3 levels of vulnerabilites you have to look in the code, which are 
        'low', 'medium', and 'hard'.
        
      Your main goal is to find vulnerabilities or code that could make the code base prone to future attacks based on the vulnerabilities.

      You will be provided with the code whose line breaks, spaces and other formatting things that makes the code look beautiful has been removed. Please assume that the original code has been properly formatted.

      Make sure to keep the riskTitle and riskDescription as concise as possible. This is just to give idea to the user exactly what is the problem. This should not be detailed analysis. 

      Do not flag the spelling or grammar mistakes in the code as long as they are not the part of vulnerability. 

      Add the comments where it is required to explain and improve the readability of the code. 

      Only change the UI and UX only if it introduces any vulnerabilites.
      
      Do not add any text in the code that does not improve the codebase in terms of functionality/readability/other factors.

      The correct code that you generate should have actually fixed the vulnerability.
      The title and description of the title should be short and concise. It does not needs to be long since this would just be used to give the idea to the user what it would be about.

      Since all the spaces and new lines have been taken out of the original code, so it is your duty to add the spaces/linebreaks back where it makes sense. The space could be between the words that had the spaces removed, or any message too.
      
      Make sure to do proper error handling in the code, if it is required to make the code efficient. 
      Fix the code and vulnerabilities in it as much as possible while making sure it serves its original purpose.
      
      While correcting the code and mentioning the comments use the industry security standards. 

      Make sure the output that you generate should have the best practices followed according to the standards set by the below organisations:
        OWASP (Open Web Application Security Project), NIST (National Institute of Standards and Technology), SANS Institute, ISO/IEC (International Organization for Standardization / International Electrotechnical Commission), CIS (Center for Internet Security), CERT (Computer Emergency Response Team) - Carnegie Mellon University, MITRE Corporation, PCI Security Standards Council
      It is not mandatory to follow all the above standards for each and every thing, but wherever it is required to follow the industry standards, you should follow them.

      While you follow the above instructions, do not overkill the use of a single mechanism to make the codebase safe. Only follow the industry practices.

      Take gaps and moments to analyse the code, think during the process, take gaps while answering. There is no need to rush. Go through the generated answer, look for the instructions again to make sure that all the instructions have been followed.

      Do not generate any instructions or other extra text content. Only return the string containing the keys and values as mentioned in below format_instructions. This string should be structured such that it could be successfully parsed into JSON format. This is the reason why I am insisting not to generate any extra text as that would be useless and in the end only the JSON content in required and shown to the user.       

      Take gaps and pauses to think and analyse. Go through the above and below mentioned instructions to generate the output as mentioned. Additionally, I want you to properly analyse the code, and instructions before you generate the output. Do not forget to take gaps and pauses. 

      <format_instructions>
        {format_instructions}
      </format_instructions>  
      
        This is the code:
        {code}
    `);

    const partialedPrompt = await prompt.partial({
      format_instructions: formatInstructions,
    });

    const chain = partialedPrompt.pipe(model).pipe(parser);

    const chainResponse = await chain.invoke({ code: code });

    console.log(chainResponse)

    return chainResponse

  } catch (error) {
    console.log("Error while getting the scanVulnerability result:")
    console.log(error)
    return {
      riskLevel: "error",
      riskTitle: "Analysis Failed",

      riskDescription: "An error occurred while analyzing the code for vulnerabilities. This could be due to network issues or API limitations. Please try again later.",
      correctCode: "Error: Unable to generate a secure version of the code due to the encountered issue.",
      vulnerabilityCardLoading: false

    }
  }
}
