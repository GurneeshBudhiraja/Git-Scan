interface CodeSnippet {
  name: string;
  content: string;
  language: string;
  isOpen?: boolean;
  isLoading?: boolean;
  isSecure?: boolean;
  message?: string;
}