interface CodeSnippet {
  name: string;
  content: string;
  language: string;
  isOpen?: boolean;
  isLoading?: boolean;
  isSecure?: boolean;
  message?: string;
}


type RiskLevel = "low" | "medium" | "high" | ""

type IsSecureType = {
  isSecure: boolean;
};

interface VulnerabilityCardContentType {
  riskLevel: RiskLevel | null;
  riskTitle: string;
  riskDescription: string;
  isSecure: boolean;
  isCode: boolean;
}

interface VulnerabilityCardType {
  repoFileCode: string
}