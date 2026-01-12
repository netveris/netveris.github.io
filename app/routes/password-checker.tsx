import { useState } from 'react';
import type { Route } from './+types/password-checker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card/card';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Progress } from '~/components/ui/progress/progress';
import { Alert, AlertDescription } from '~/components/ui/alert/alert';
import { ToolHeader } from '~/components/tool-header';
import { Shield, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '~/components/ui/button/button';
import styles from './password-checker.module.css';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Password Strength Checker - Netveris' },
    { name: 'description', content: 'Analyze password strength with detailed feedback and security recommendations' },
  ];
};

interface PasswordAnalysis {
  score: number;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  entropy: number;
  timeToCrack: string;
  feedback: string[];
  passed: string[];
  failed: string[];
}

function analyzePassword(password: string): PasswordAnalysis {
  const feedback: string[] = [];
  const passed: string[] = [];
  const failed: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 12) {
    score += 20;
    passed.push('Length is 12+ characters');
  } else if (password.length >= 8) {
    score += 10;
    feedback.push('Consider using 12+ characters for better security');
    passed.push('Length is 8+ characters');
  } else {
    failed.push('Length should be at least 8 characters');
  }

  // Lowercase letters
  if (/[a-z]/.test(password)) {
    score += 10;
    passed.push('Contains lowercase letters');
  } else {
    failed.push('Add lowercase letters (a-z)');
  }

  // Uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 10;
    passed.push('Contains uppercase letters');
  } else {
    failed.push('Add uppercase letters (A-Z)');
  }

  // Numbers
  if (/\d/.test(password)) {
    score += 10;
    passed.push('Contains numbers');
  } else {
    failed.push('Add numbers (0-9)');
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
    passed.push('Contains special characters');
  } else {
    failed.push('Add special characters (!@#$%^&*)');
  }

  // No common patterns
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000'];
  const hasCommonPattern = commonPatterns.some(pattern => 
    password.toLowerCase().includes(pattern)
  );
  
  if (!hasCommonPattern) {
    score += 15;
    passed.push('No common patterns detected');
  } else {
    failed.push('Avoid common patterns (123, abc, password, etc.)');
  }

  // No repeating characters
  if (!/(.)\1{2,}/.test(password)) {
    score += 10;
    passed.push('No repeating characters');
  } else {
    failed.push('Avoid repeating characters (aaa, 111, etc.)');
  }

  // Variety bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10;
    passed.push('Good character variety');
  }

  // Calculate entropy
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/\d/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
  
  const entropy = password.length * Math.log2(charset);

  // Time to crack estimation
  const combinations = Math.pow(charset, password.length);
  const guessesPerSecond = 1e10; // 10 billion guesses per second
  const secondsToCrack = combinations / guessesPerSecond;
  
  let timeToCrack = '';
  if (secondsToCrack < 1) {
    timeToCrack = 'Instant';
  } else if (secondsToCrack < 60) {
    timeToCrack = `${Math.round(secondsToCrack)} seconds`;
  } else if (secondsToCrack < 3600) {
    timeToCrack = `${Math.round(secondsToCrack / 60)} minutes`;
  } else if (secondsToCrack < 86400) {
    timeToCrack = `${Math.round(secondsToCrack / 3600)} hours`;
  } else if (secondsToCrack < 31536000) {
    timeToCrack = `${Math.round(secondsToCrack / 86400)} days`;
  } else if (secondsToCrack < 3153600000) {
    timeToCrack = `${Math.round(secondsToCrack / 31536000)} years`;
  } else {
    timeToCrack = 'Centuries';
  }

  // Determine strength
  let strength: PasswordAnalysis['strength'];
  if (score >= 90) strength = 'Very Strong';
  else if (score >= 70) strength = 'Strong';
  else if (score >= 50) strength = 'Good';
  else if (score >= 30) strength = 'Fair';
  else if (score >= 15) strength = 'Weak';
  else strength = 'Very Weak';

  return {
    score,
    strength,
    entropy: Math.round(entropy),
    timeToCrack,
    feedback,
    passed,
    failed,
  };
}

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const analysis = password ? analyzePassword(password) : null;

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'var(--color-success-9)';
      case 'Strong': return 'var(--color-success-8)';
      case 'Good': return 'var(--color-accent-9)';
      case 'Fair': return 'var(--amber-9)';
      case 'Weak': return 'var(--color-error-8)';
      default: return 'var(--color-error-9)';
    }
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        title="Password Strength Checker"
        description="Analyze your password strength and get security recommendations"
        icon={<Shield />}
      />

      <div className={styles.content}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Enter Password</CardTitle>
            <CardDescription>
              Your password is never sent to any server and remains completely private
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.inputWrapper}>
              <Label htmlFor="password">Password</Label>
              <div className={styles.passwordInput}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password to analyze..."
                  className={styles.input}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.toggleButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>

            {analysis && (
              <div className={styles.analysis}>
                <div className={styles.strengthMeter}>
                  <div className={styles.strengthHeader}>
                    <span className={styles.strengthLabel}>Strength:</span>
                    <span 
                      className={styles.strengthValue}
                      style={{ color: getStrengthColor(analysis.strength) }}
                    >
                      {analysis.strength}
                    </span>
                  </div>
                  <Progress 
                    value={analysis.score} 
                    className={styles.progress}
                    style={{ 
                      '--progress-color': getStrengthColor(analysis.strength) 
                    } as React.CSSProperties}
                  />
                  <div className={styles.scoreInfo}>
                    <span>Score: {analysis.score}/100</span>
                    <span>Entropy: {analysis.entropy} bits</span>
                  </div>
                </div>

                <Alert className={styles.crackTime}>
                  <AlertTriangle size={18} />
                  <AlertDescription>
                    <strong>Time to crack:</strong> {analysis.timeToCrack}
                    <br />
                    <span className={styles.crackNote}>
                      (Estimated at 10 billion guesses/second)
                    </span>
                  </AlertDescription>
                </Alert>

                {analysis.passed.length > 0 && (
                  <div className={styles.feedbackSection}>
                    <h3 className={styles.feedbackTitle}>
                      <CheckCircle size={18} className={styles.successIcon} />
                      Passed Checks
                    </h3>
                    <ul className={styles.feedbackList}>
                      {analysis.passed.map((item, index) => (
                        <li key={index} className={styles.passedItem}>
                          <CheckCircle size={14} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.failed.length > 0 && (
                  <div className={styles.feedbackSection}>
                    <h3 className={styles.feedbackTitle}>
                      <XCircle size={18} className={styles.errorIcon} />
                      Failed Checks
                    </h3>
                    <ul className={styles.feedbackList}>
                      {analysis.failed.map((item, index) => (
                        <li key={index} className={styles.failedItem}>
                          <XCircle size={14} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.feedback.length > 0 && (
                  <div className={styles.feedbackSection}>
                    <h3 className={styles.feedbackTitle}>
                      <AlertTriangle size={18} className={styles.warningIcon} />
                      Recommendations
                    </h3>
                    <ul className={styles.feedbackList}>
                      {analysis.feedback.map((item, index) => (
                        <li key={index} className={styles.recommendationItem}>
                          <AlertTriangle size={14} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Password Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={styles.tipsList}>
              <li>Use at least 12 characters for strong passwords</li>
              <li>Mix uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
              <li>Avoid common words and patterns</li>
              <li>Don't reuse passwords across sites</li>
              <li>Use a password manager to generate and store passwords</li>
              <li>Enable two-factor authentication (2FA) when available</li>
              <li>Change passwords if you suspect a breach</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
