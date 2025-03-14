declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_GITHUB_TOKEN: string;
      NEXT_GITHUB_API: string;
      NEXT_GEMINI_KEY: string;
    }
  }
}

export { }
