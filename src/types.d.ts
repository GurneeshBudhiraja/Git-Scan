interface CodeSnippet {
  name: string;
  content: string;
  language: string;
  isOpen?: boolean;
  isLoading?: boolean;
  isSecure?: boolean;
  message?: string;
}


type RiskLevel = "low" | "medium" | "high"

interface VulnerabilityCardType {
  riskLevel: RiskLevel;
  riskTitle: string;
  riskDescription: string;
  riskCode?: string;
}