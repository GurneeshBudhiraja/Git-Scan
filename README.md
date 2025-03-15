# GitScan - AI-Powered Security Scanner for GitHub Repositories

![GitScan](https://github.com/user-attachments/assets/3a5c884c-dc0e-48d6-bdbe-b2bcfe9edeb6)

## 🚀 Overview
GitScan is an **AI-powered security tool** that scans public GitHub repositories for **vulnerabilities, misconfigurations, and exposed secrets**—giving developers instant, actionable insights to secure their code. Built for the **SANS AI Cybersecurity Hackathon 2025**, it aims to simplify security analysis for developers.

## 🔥 Features
- **Automated AI-Powered Security Scanning** - Instantly detects vulnerabilities in repositories.
- **Detects Exposed Secrets & Misconfigurations** - Flags API keys, authentication flaws, and weak security practices.
- **Actionable AI-Powered Fixes & Insights** - Provides explanations with recommended fixes.
- **Simple GitHub Integration** - Scan by entering a repository URL or using `git-scan.com` as a replacement for `github.com`.
- **Developer-Friendly UX** - No complex setup or security expertise required.

## 🛠️ How It Works
1. **Enter a GitHub URL** to scan.
2. The AI model analyzes the codebase for vulnerabilities.
3. **Security issues are flagged**, categorized by severity.
4. AI provides **fix recommendations**, allowing developers to improve security effortlessly.

## 🏗️ Built With
- **Frontend:** Next.js 15, Tailwind CSS
- **Backend:** Next.js 15
- **AI Integration:** Google Gemini via LangChain
- **Deployment:** Vercel

## 🛠️ Installation & Setup
### Steps to Run Locally
1. **Clone the repository:**  
   ```sh
   git clone https://github.com/GurneeshBudhiraja/Git-Scan.git
   cd Git-Scan
   ```
2. **Install dependencies:**  
   ```sh
   npm install
   ```
3. **Run the development server:**  
   ```sh
   npm run dev
   ```
4. **Open in browser:**  
   Visit `http://localhost:3000`

## ⚡ Challenges Overcome
- Efficient **parsing of large repositories** for real-time security insights.
- Optimizing AI-generated security explanations to be **developer-friendly**.
- Balancing performance while keeping API calls **cost-effective**.

## 🚀 Future Enhancements
- 🔹 **CI/CD Integration** - Automate security checks in pipelines.
- 🔹 **Private Repo Support** - Secure authentication for scanning private repositories.
- 🔹 **Expanded AI Models** - More advanced vulnerability detection.
- 🔹 **Automated PR Comments** - AI-suggested fixes in GitHub pull requests.
- 🔹 **Multi-Platform Support** - Extend beyond GitHub to GitLab, Bitbucket, etc.

## 🏆 Meeting Hackathon Standards
GitScan aligns with the **SANS AI Cybersecurity Hackathon** judging criteria:
- **Innovation & Impact:** AI-powered automation reduces manual security effort.
- **Technical Execution:** Built using Next.js 15, LangChain, and Gemini AI.
- **Practicality & Usability:** Developer-friendly, requiring minimal setup.
- **Scalability & Future Enhancements:** Plans for CI/CD, private repo scanning, and deeper AI insights.
- **Relevance to Cybersecurity:** Identifies **code misconfigurations, weak authentication, hardcoded secrets**, and other risks.

## 📜 License
This project is **open-source** under the [MIT License](LICENSE).
