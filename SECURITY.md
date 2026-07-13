# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | ✅ Active support |
| < 2.0   | ❌ End of life    |

## Security Status

**Current Status:** ✅ **Zero Known Vulnerabilities**

The Marvin SDK has undergone a comprehensive security audit and all identified vulnerabilities have been fixed:

- ✅ 8 HIGH priority vulnerabilities eliminated
- ✅ 7 MEDIUM priority security issues resolved
- ✅ 5 LOW priority code quality improvements implemented

**Last Security Audit:** July 11, 2026  
**[View Complete Audit Report →](./COMPLETE_SECURITY_AUDIT.md)**

## Security Features

### Input Validation & Sanitization

- **Path Injection Prevention** - All path parameters validated to prevent traversal attacks
- **Email Validation** - RFC 5322 compliant email format validation
- **Webhook URL Validation** - SSRF prevention for webhook endpoints
- **File Upload Validation** - Size limits (10MB), MIME type checking, filename sanitization
- **Form Data Validation** - XSS prevention with script tag detection

### Data Protection

- **Token Sanitization** - Automatic redaction of sensitive data in logs and errors
  - Tokens, passwords, secrets, API keys automatically masked
  - Recursive sanitization for nested objects and arrays
- **Password Security** - Passwords never returned in API responses (write-only)
- **CSRF Protection** - Session authentication with CSRF token support

### Network Security

- **Retry Logic** - Automatic exponential backoff for transient failures
- **Timeout Limits** - Maximum 2-minute timeout to prevent resource exhaustion
- **HTTPS Enforcement** - Production environments require HTTPS
- **Request Validation** - All requests validated before transmission

### Type Safety

- **100% TypeScript** - No `any` types, complete type coverage
- **Compile-Time Safety** - Catch errors before runtime
- **Generic Type Support** - Type-safe field access with generics

## Reporting a Vulnerability

**We take security seriously.** If you discover a security vulnerability in the Marvin SDK, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email: **security@inneropen.io**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### What to Expect

1. **Acknowledgment** - We'll acknowledge your report within 48 hours
2. **Assessment** - We'll assess the severity and impact within 7 days
3. **Fix Timeline** - We'll provide an estimated timeline for the fix
4. **Credit** - We'll credit you in the security advisory (if desired)
5. **Disclosure** - We'll coordinate public disclosure after the fix is released

### Severity Levels

We use the following severity classifications:

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **CRITICAL** | Remote code execution, data breach | 24 hours |
| **HIGH** | Authentication bypass, privilege escalation | 48 hours |
| **MEDIUM** | Information disclosure, denial of service | 7 days |
| **LOW** | Minor issues, best practice improvements | 30 days |

## Security Best Practices

### For SDK Users

1. **Keep Updated** - Always use the latest stable version
2. **Environment Variables** - Never commit tokens to version control
3. **Token Rotation** - Regenerate user tokens periodically
4. **Validate Input** - Always validate user input on your side too
5. **HTTPS Only** - Use HTTPS in production environments
6. **Debug Mode** - Disable debug mode in production
7. **CSRF Protection** - Enable CSRF tokens for browser-based UIs
8. **Least Privilege** - Use site client tokens (read-only) when possible

### For Contributors

1. **Code Review** - All changes require security review
2. **No Secrets** - Never commit secrets, tokens, or credentials
3. **Dependency Audits** - Run `npm audit` before submitting PRs
4. **Input Validation** - Validate all external input
5. **Error Handling** - Never expose sensitive data in error messages
6. **Testing** - Include security tests for new features
7. **Documentation** - Document security implications of changes

## Vulnerability Disclosure Policy

### Coordinated Disclosure

We follow a coordinated vulnerability disclosure process:

1. **Private Reporting** - Vulnerabilities reported privately to security@inneropen.io
2. **Assessment & Fix** - We develop and test a fix privately
3. **Security Release** - We release a patched version
4. **Public Disclosure** - We publish a security advisory 7 days after the release
5. **CVE Assignment** - We request CVE IDs for high-severity issues

### Public Disclosure Timeline

- **Day 0** - Vulnerability reported privately
- **Day 1-7** - Assessment and fix development
- **Day 7-14** - Testing and release preparation
- **Day 14** - Security release published
- **Day 21** - Public advisory published (if applicable)

## Security Advisories

Security advisories are published at:
- GitHub Security Advisories: https://github.com/inneropen/marvin-sdk/security/advisories
- NPM Advisory Database: https://www.npmjs.com/advisories

## Past Security Advisories

### 2026-07-11 - Comprehensive Security Audit

**Summary:** Completed comprehensive security audit and fixed 20 issues (8 HIGH, 7 MEDIUM, 5 LOW priority).

**Affected Versions:** < 2.0.1

**Fixed in:** v2.0.1

**Impact:** Multiple security vulnerabilities including token exposure, path injection, SSRF, XSS

**Details:** [COMPLETE_SECURITY_AUDIT.md](./COMPLETE_SECURITY_AUDIT.md)

## Security Resources

- 🔒 [Complete Security Audit](./COMPLETE_SECURITY_AUDIT.md)
- 📋 [Security Fixes Summary](./SECURITY_FIXES_SUMMARY.md)
- 🔐 [Authentication Guide](./AUTHENTICATION.md)
- 🧪 [Security Testing Guide](./TESTING.md)
- ⚠️ [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)

## Security Contact

- **Email:** security@inneropen.io
- **Response Time:** 48 hours
- **PGP Key:** Available on request

## Acknowledgments

We'd like to thank the following security researchers for responsibly disclosing vulnerabilities:

- Internal security audit team (July 2026) - 20 vulnerabilities fixed

---

**Last Updated:** July 11, 2026  
**Policy Version:** 1.0
