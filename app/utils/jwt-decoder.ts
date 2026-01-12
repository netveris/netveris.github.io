import type { JWTHeader, JWTPayload, JWTAnalysis, SecurityIssue } from "~/types/security";

/**
 * Decodes a JWT token without verification (client-side only)
 */
export function decodeJWT(token: string): JWTAnalysis | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;

    const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/"))) as JWTHeader;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))) as JWTPayload;

    const issues = analyzeJWT(header, payload);

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < now : false;
    const expiresIn = payload.exp ? formatTimeRemaining(payload.exp - now) : undefined;
    const issuedAt = payload.iat ? new Date(payload.iat * 1000).toISOString() : undefined;

    return {
      header,
      payload,
      signature,
      issues,
      isExpired,
      expiresIn,
      issuedAt,
    };
  } catch {
    return null;
  }
}

function analyzeJWT(header: JWTHeader, payload: JWTPayload): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check for 'none' algorithm
  if (header.alg === "none") {
    issues.push({
      id: "jwt-alg-none",
      title: 'Algorithm set to "none"',
      severity: "high",
      category: "JWT Security",
      description: "The JWT uses no signature algorithm, making it completely unverified.",
      recommendation: 'Always use strong signing algorithms like RS256 or HS256. Never accept "none".',
      impact: "Any attacker can forge tokens with arbitrary claims.",
      attackScenario:
        "An attacker modifies the payload to escalate privileges, removes the signature, and the server accepts it.",
      remediation: 'Always use strong signing algorithms like RS256 or HS256. Never accept "none".',
    });
  }

  // Check for weak symmetric algorithms
  if (header.alg === "HS256" || header.alg === "HS384" || header.alg === "HS512") {
    issues.push({
      id: "jwt-symmetric-alg",
      title: "Symmetric algorithm in use",
      severity: "medium",
      category: "JWT Security",
      description: "HMAC-based algorithms require the same secret on both client and server.",
      recommendation: "Consider using asymmetric algorithms (RS256, ES256) for better key management.",
      impact: "If the secret leaks, attackers can forge valid tokens.",
      attackScenario: "Secret exposed in source code or logs allows token forgery.",
      remediation: "Consider using asymmetric algorithms (RS256, ES256) for better key management.",
    });
  }

  // Check for missing expiration
  if (!payload.exp) {
    issues.push({
      id: "jwt-no-exp",
      title: "Missing expiration claim",
      severity: "high",
      category: "JWT Security",
      description: "The token has no expiration time (exp claim).",
      recommendation: "Always set an exp claim with a reasonable lifetime (e.g., 15 minutes for access tokens).",
      impact: "Tokens remain valid indefinitely, increasing replay attack risk.",
      attackScenario: "Stolen tokens can be used forever unless manually revoked.",
      remediation: "Always set an exp claim with a reasonable lifetime (e.g., 15 minutes for access tokens).",
    });
  } else {
    // Check for excessive token lifetime
    const now = Math.floor(Date.now() / 1000);
    const lifetime = payload.exp - (payload.iat || now);
    const oneDay = 86400;

    if (lifetime > oneDay) {
      issues.push({
        id: "jwt-long-lifetime",
        title: "Excessive token lifetime",
        severity: "medium",
        category: "JWT Security",
        description: `Token lifetime is ${Math.floor(lifetime / 3600)} hours.`,
        recommendation: "Use short-lived access tokens (15-60 minutes) with refresh token rotation.",
        impact: "Long-lived tokens increase the window for replay attacks.",
        attackScenario: "Stolen token remains valid for extended period, allowing prolonged unauthorized access.",
        remediation: "Use short-lived access tokens (15-60 minutes) with refresh token rotation.",
      });
    }
  }

  // Check for missing issued-at
  if (!payload.iat) {
    issues.push({
      id: "jwt-no-iat",
      title: "Missing issued-at claim",
      severity: "medium",
      category: "JWT Security",
      description: "The token lacks an iat (issued at) claim.",
      recommendation: "Include iat claim to track when tokens were issued.",
      impact: "Difficult to track token age and implement time-based security policies.",
      attackScenario: "Cannot detect token replay or enforce token freshness requirements.",
      remediation: "Include iat claim to track when tokens were issued.",
    });
  }

  // Check for sensitive data in payload
  const sensitiveKeys = ["password", "secret", "ssn", "credit_card", "api_key"];
  const payloadKeys = Object.keys(payload).map((k) => k.toLowerCase());
  const foundSensitive = sensitiveKeys.filter((key) => payloadKeys.includes(key));

  if (foundSensitive.length > 0) {
    issues.push({
      id: "jwt-sensitive-data",
      title: "Sensitive data in payload",
      severity: "high",
      category: "JWT Security",
      description: `Potentially sensitive fields detected: ${foundSensitive.join(", ")}`,
      recommendation: "Never store sensitive data in JWT payloads. Use opaque tokens or encrypt sensitive claims.",
      impact: "JWT payloads are base64-encoded, not encrypted. Anyone can decode and read them.",
      attackScenario: "Attacker intercepts token and extracts sensitive information from payload.",
      remediation: "Never store sensitive data in JWT payloads. Use opaque tokens or encrypt sensitive claims.",
    });
  }

  return issues;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds < 0) return 'Expired';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
