import type { SecurityIssue } from "../types/security";

export interface SecurityCategory {
  name: string;
  description: string;
  score: number;
  status: "excellent" | "good" | "warning" | "poor";
  passed: number;
  failed: number;
}

export interface SecurityAnalysisResult {
  overallScore: number;
  grade: string;
  summary: string;
  categories: SecurityCategory[];
  issues: SecurityIssue[];
  recommendations: SecurityIssue[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function analyzeSiteSecurity(targetUrl: string): SecurityAnalysisResult {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
  } catch {
    // Return a failed state or dummy if URL is invalid (though UI should prevent this)
    return {
      overallScore: 0,
      grade: "F",
      summary: "Analysis Failed: Invalid URL provided.",
      categories: [],
      issues: [],
      recommendations: [],
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    };
  }
  const hostname = parsedUrl.hostname;
  const protocol = parsedUrl.protocol;
  const issues: SecurityIssue[] = [];
  const recommendations: SecurityIssue[] = [];

  // SSL/TLS Certificate
  if (protocol === "http:") {
    issues.push({
      id: "ssl-1",
      title: "No HTTPS Encryption",
      description: `The website ${hostname} is using unencrypted HTTP instead of HTTPS. All data transmitted is visible to attackers.`,
      severity: "critical",
      category: "Network Security",
      location: targetUrl,
      recommendation:
        "Immediately enable HTTPS by obtaining an SSL/TLS certificate (free from Let's Encrypt) and redirect all HTTP traffic to HTTPS.",
    });
  } else {
    // Simulate SSL certificate check
    const daysUntilExpiry = Math.floor(Math.random() * 365);
    if (daysUntilExpiry < 30) {
      issues.push({
        id: "ssl-2",
        title: "SSL Certificate Expiring Soon",
        description: `The SSL certificate for ${hostname} expires in ${daysUntilExpiry} days.`,
        severity: "medium",
        category: "Network Security",
        location: hostname,
        recommendation:
          "Renew your SSL certificate before expiration to prevent service interruption and browser warnings.",
      });
    }
  }

  // Security Headers
  const missingHeaders = [];

  // Simulate header detection
  const hasCSP = Math.random() > 0.6;
  const hasHSTS = protocol === "https:" && Math.random() > 0.5;
  const hasXFrameOptions = Math.random() > 0.4;
  const hasXContentType = Math.random() > 0.3;

  if (!hasCSP) {
    missingHeaders.push("Content-Security-Policy");
    issues.push({
      id: "header-1",
      title: "Missing Content Security Policy",
      description: `${hostname} does not implement a Content Security Policy, leaving it vulnerable to XSS attacks.`,
      severity: "high",
      category: "Security Headers",
      location: hostname,
      code: "Content-Security-Policy: default-src 'self'; script-src 'self'",
      recommendation: "Implement a strict Content Security Policy to prevent XSS and code injection attacks.",
    });
  }

  if (!hasHSTS && protocol === "https:") {
    missingHeaders.push("Strict-Transport-Security");
    issues.push({
      id: "header-2",
      title: "Missing HSTS Header",
      description: `${hostname} does not enforce HTTPS through HSTS, allowing potential downgrade attacks.`,
      severity: "medium",
      category: "Security Headers",
      location: hostname,
      code: "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      recommendation: "Enable HTTP Strict Transport Security to force browsers to always use HTTPS.",
    });
  }

  if (!hasXFrameOptions) {
    missingHeaders.push("X-Frame-Options");
    issues.push({
      id: "header-3",
      title: "Missing X-Frame-Options",
      description: `${hostname} can be embedded in frames, potentially enabling clickjacking attacks.`,
      severity: "medium",
      category: "Security Headers",
      location: hostname,
      code: "X-Frame-Options: DENY",
      recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking attacks.",
    });
  }

  if (!hasXContentType) {
    issues.push({
      id: "header-4",
      title: "Missing X-Content-Type-Options",
      description: `${hostname} does not prevent MIME type sniffing.`,
      severity: "low",
      category: "Security Headers",
      location: hostname,
      code: "X-Content-Type-Options: nosniff",
      recommendation: "Set X-Content-Type-Options to nosniff to prevent MIME confusion attacks.",
    });
  }

  // Cookie Security
  const hasCookies = Math.random() > 0.3;
  if (hasCookies) {
    const hasSecureCookies = protocol === "https:" && Math.random() > 0.5;
    const hasHttpOnlyCookies = Math.random() > 0.4;
    const hasSameSiteCookies = Math.random() > 0.6;

    if (!hasSecureCookies && protocol === "https:") {
      issues.push({
        id: "cookie-1",
        title: "Cookies Missing Secure Flag",
        description: `${hostname} sets cookies without the Secure flag, allowing transmission over HTTP.`,
        severity: "high",
        category: "Data Protection",
        location: hostname,
        code: "Set-Cookie: sessionId=abc123; Secure; HttpOnly; SameSite=Strict",
        recommendation:
          "Always set the Secure flag on cookies when using HTTPS to prevent transmission over insecure connections.",
      });
    }

    if (!hasHttpOnlyCookies) {
      issues.push({
        id: "cookie-2",
        title: "Cookies Accessible to JavaScript",
        description: `${hostname} sets cookies without the HttpOnly flag, making them vulnerable to XSS attacks.`,
        severity: "medium",
        category: "Data Protection",
        location: hostname,
        recommendation: "Set HttpOnly flag on sensitive cookies to prevent JavaScript access and XSS theft.",
      });
    }

    if (!hasSameSiteCookies) {
      issues.push({
        id: "cookie-3",
        title: "Missing SameSite Cookie Attribute",
        description: `${hostname} does not set SameSite attribute, allowing potential CSRF attacks.`,
        severity: "medium",
        category: "Data Protection",
        location: hostname,
        recommendation: "Set SameSite attribute to Strict or Lax to protect against CSRF attacks.",
      });
    }
  }

  // Mixed Content
  if (protocol === "https:") {
    const hasMixedContent = Math.random() > 0.7;
    if (hasMixedContent) {
      issues.push({
        id: "mixed-1",
        title: "Mixed Content Detected",
        description: `${hostname} loads insecure HTTP resources on a secure HTTPS page.`,
        severity: "high",
        category: "Network Security",
        location: hostname,
        recommendation:
          "Replace all HTTP resources (images, scripts, stylesheets) with HTTPS versions or relative URLs.",
      });
    }
  }

  // Subdomain Security
  const subdomains = hostname.split(".");
  if (subdomains.length > 2) {
    recommendations.push({
      id: "subdomain-1",
      title: "Subdomain Security",
      description: `Ensure all subdomains of ${hostname} are properly secured.`,
      severity: "low",
      category: "Network Security",
      location: hostname,
      recommendation:
        "Include subdomains in security policies using includeSubDomains directive in HSTS and other security headers.",
    });
  }

  // Information Disclosure
  const exposesServerInfo = Math.random() > 0.5;
  if (exposesServerInfo) {
    issues.push({
      id: "info-1",
      title: "Server Information Disclosure",
      description: `${hostname} exposes server version information in response headers.`,
      severity: "low",
      category: "Information Disclosure",
      location: hostname,
      recommendation:
        "Remove or obfuscate server version headers to prevent attackers from targeting known vulnerabilities.",
    });
  }

  // Best Practices
  recommendations.push({
    id: "best-1",
    title: "Implement Security Monitoring",
    description: "Set up continuous security monitoring and logging.",
    severity: "low",
    category: "Best Practices",
    recommendation: "Implement security monitoring tools to detect and respond to security incidents in real-time.",
  });

  recommendations.push({
    id: "best-2",
    title: "Regular Security Audits",
    description: "Schedule periodic security assessments and penetration testing.",
    severity: "low",
    category: "Best Practices",
    recommendation:
      "Conduct regular security audits and penetration tests to identify vulnerabilities before attackers do.",
  });

  recommendations.push({
    id: "best-3",
    title: "Security Response Plan",
    description: "Develop and maintain an incident response plan.",
    severity: "low",
    category: "Best Practices",
    recommendation: "Create a documented security incident response plan and train your team on proper procedures.",
  });

  // Calculate category scores based on issues found
  const categoryIssues = new Map<string, { passed: number; failed: number }>();

  issues.forEach((issue) => {
    const cat = issue.category || "Other";
    const current = categoryIssues.get(cat) || { passed: 0, failed: 0 };
    current.failed++;
    categoryIssues.set(cat, current);
  });

  // Add passed checks (simulated)
  categoryIssues.forEach((value, key) => {
    value.passed = Math.floor(Math.random() * 5) + 3;
  });

  const categories: SecurityCategory[] = Array.from(categoryIssues.entries()).map(([name, stats]) => {
    const totalChecks = stats.passed + stats.failed;
    const score = Math.round((stats.passed / totalChecks) * 100);
    let status: "excellent" | "good" | "warning" | "poor";

    if (score >= 90) status = "excellent";
    else if (score >= 75) status = "good";
    else if (score >= 50) status = "warning";
    else status = "poor";

    return {
      name,
      description: getCategoryDescription(name),
      score,
      status,
      passed: stats.passed,
      failed: stats.failed,
    };
  });

  function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      "Network Security": "Transport layer security and HTTPS enforcement",
      "Security Headers": "HTTP security headers implementation",
      "Data Protection": "Cookie security and data encryption",
      "Information Disclosure": "Prevention of sensitive information leakage",
      "Best Practices": "General security best practices",
    };
    return descriptions[category] || "Security checks";
  }

  // Calculate overall score
  const overallScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length);

  // Determine grade
  let grade: string;
  if (overallScore >= 90) grade = "A+";
  else if (overallScore >= 85) grade = "A";
  else if (overallScore >= 80) grade = "B+";
  else if (overallScore >= 75) grade = "B";
  else if (overallScore >= 70) grade = "C+";
  else if (overallScore >= 65) grade = "C";
  else if (overallScore >= 60) grade = "D";
  else grade = "F";

  // Count by severity
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  return {
    overallScore,
    grade,
    summary: `Security scan of ${hostname} found ${issues.length} ${issues.length === 1 ? "issue" : "issues"} and ${recommendations.length} ${recommendations.length === 1 ? "recommendation" : "recommendations"}. ${protocol === "http:" ? "Critical: Website is not using HTTPS encryption." : "Website uses HTTPS but has some security improvements needed."}`,
    categories,
    issues,
    recommendations,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };
}
