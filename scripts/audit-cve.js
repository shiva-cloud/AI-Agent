// Automated Monthly Dependency CVE Audit Tool (Rec 143)
// Performs automated security audit of package dependencies, checks for known CVEs,
// and produces structured compliance reports.

import { execSync } from 'node:child_process';


export function runSecurityAudit() {
  const result = {
    auditedAt: new Date().toISOString(),
    status: 'pass',
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0
    },
    summary: 'No critical or high severity vulnerabilities found'
  };

  try {
    const rawOutput = execSync('npm audit --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const auditData = JSON.parse(rawOutput);
    if (auditData.metadata && auditData.metadata.vulnerabilities) {
      result.vulnerabilities = {
        ...result.vulnerabilities,
        ...auditData.metadata.vulnerabilities
      };
      if (result.vulnerabilities.critical > 0 || result.vulnerabilities.high > 0) {
        result.status = 'action_required';
        result.summary = `${result.vulnerabilities.critical} critical and ${result.vulnerabilities.high} high severity vulnerabilities detected.`;
      }
    }
  } catch (err) {
    result.status = 'error';
    result.summary = 'Dependency audit could not complete successfully';
    // npm audit exits with 1 when vulnerabilities are found
    if (err.stdout) {
      try {
        const auditData = JSON.parse(err.stdout);
        if (auditData.metadata && auditData.metadata.vulnerabilities) {
          result.status = 'pass';
          result.vulnerabilities = {
            ...result.vulnerabilities,
            ...auditData.metadata.vulnerabilities
          };
          if (result.vulnerabilities.critical > 0 || result.vulnerabilities.high > 0) {
            result.status = 'action_required';
            result.summary = `${result.vulnerabilities.critical} critical and ${result.vulnerabilities.high} high severity vulnerabilities detected.`;
          }
        }
      } catch {
        result.status = 'error';
        result.summary = 'Unable to parse npm audit output';
      }
    }
  }

  return result;
}

if (process.argv[1] && process.argv[1].endsWith('audit-cve.js')) {
  const report = runSecurityAudit();
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'pass') {
    process.exit(1);
  }
}
