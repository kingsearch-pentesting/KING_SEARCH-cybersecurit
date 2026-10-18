# KING_SEARCH-cybersecurit
KING_SEARCH cybersecurity automation and security-intelligence platform — core project architecture, security engine, backend, frontend, platform capabilities and long-term product roadmap; read this area for any work involving KING_SEARCH

Details
  ● KING_SEARCH is the user's primary long-term cybersecurity platform project
  ● The platform is designed to unify penetration testing, security assessment, reconnaissance, attack-surface discovery, vulnerability analysis, threat intelligence, automation, reporting, analytics and AI-assisted security intelligence
  ● KING_SEARCH is intended to evolve from a large cybersecurity execution engine into a unified API-driven, real-time, multi-tenant cybersecurity platform
  ● The project is designed as a layered system rather than a collection of independent scripts
  ● Core philosophy: combine many security tools and higher-level security-analysis engines into one orchestrated platform that converts raw tool execution into structured security intelligence

Current architectural focus
  ● Stabilize and integrate the existing backend/API and KING_SEARCH execution engine before another major frontend implementation
  ● Establish a clean boundary between the FastAPI control plane and the KING_SEARCH security execution engine
  ● Make asynchronous scan/job execution durable and scalable
  ● Normalize raw tool output into structured results and security findings
  ● Establish reliable real-time execution/progress/event communication
  ● Integrate the existing backend APIs with the Next.js frontend through real API contracts
  ● Prepare the architecture for organization/tenant isolation and future SaaS deployment
  ● Gradually add AI-assisted correlation, analysis, prioritization and security intelligence above the deterministic security engine
  ● Expand from individual security-tool execution toward reusable automated security workflows

Core security engine
  ● `King_Search/` is the core security execution engine
  ● Contains 45+ major security tools according to the user's current project inventory
  ● Contains 5000+ security-tool commands according to the user's current inventory
  ● Acts as an orchestration and automation layer across a large ecosystem of external security tools
  ● Core engine areas include configuration, dataclasses, structured logging, concurrency, asynchronous tool execution, tool registration, initialization, orchestration, subprocess execution, progress tracking, report generation, severity classification, vulnerability categorization, input processing, statistics and unified tool execution
  ● Core execution architecture is designed around asynchronous execution, concurrency management, resource monitoring, structured results and centralized orchestration

Integrated security tools
 ● Nmap			● Masscan		● Rustscan		● Nikto
 ● WhatWeb		● Nuclei		● SQLMap		● XSSer
 ● Dalfox		● Commix		● FFUF			● Gobuster
 ● Dirb			● Dirsearch		● Sublist3r		● Subfinder
 ● Amass		● TheHarvester	● Katana 		● Assetfinder
 ● GoSpider		● Cariddi		● Gau			● Waybackurls
 ● Waymore		● Curl			● HTTPX			● SSLScan
 ● DNSRecon		● Joomscan		● CeWL			● Hashcat
 ● Metasploit-related security assessment capabilities
 ● Additional security tools and commands continue to evolve as KING_SEARCH expands

Advanced security modules
  ● KING_SEARCH contains a second layer of higher-level security-analysis and automation modules built above the underlying tools
  ● These modules combine multiple tools, custom logic, parsing, analysis, classification and automation
  ● `Access_Control_Security_Assessment.py`
  ● `API_Fuzzing.py`
  ● `Attack_Surface_Discovery.py`
  ● `Authentication_Bypass_Attack.py`
  ● `Google-Dorks_Automation.py`
  ● `Social_Media_Intelligence.py`
  ● `AI-Powered_Security_Scanner.py`
  ● `AWS_Misconfiguration_Cloud_Attack.py`
  ● Additional 3000–5000+ line modules include Intelligent API Fuzzer, Brute-force Oracle Attack, Bug-Bounty Reporting, Advanced Web Crawler Analyzer, Danger Zone Web Crawler Security Analyzer, Advanced Credential Validator, Enhanced Curl Analyzer, CVE Mapper, Dark Web Threat Intelligence, Enterprise URL Extractor, Sensitive Data Extractor, Hash Analysis/Auditing/Cracking, HTTP Request Smuggling Scanner, IDOR Vulnerability Scanner, NoSQL Injection, SQL Injection/Auth Bypass, Insecure Deserialization Attack, JavaScript Security Analyzer/Exploitation, JWT Token Security Tester, Live Attack Replay Engine, Live Server Analysis, Login Bypass Analyzer, Metasploit Vulnerability Assessment, OAuth Misconfiguration Scanner, OAuth Vulnerability Scanner/Attack, 403/401/2FA/OTP Bypass, Phishing Site Detector/Analyzer, Remote Code Execution Attack, Server-Side Remote Code Execution, Server-Side Template Injection, Session Hijacking/Escalation and Subdomain Takeover Scanner

Security capability domains
  ● Reconnaissance and asset discovery
  ● Attack-surface discovery
  ● Network scanning and service enumeration
  ● Web application security testing
  ● API security testing and fuzzing
  ● Authentication and authorization assessment
  ● Vulnerability discovery and CVE mapping
  ● Cloud security and cloud misconfiguration assessment
  ● JavaScript/client-side security analysis
  ● JWT and session security analysis
  ● OAuth security assessment
  ● Sensitive-data discovery
  ● Threat intelligence
  ● Bug-bounty security workflows and reporting
  ● Automated security assessment
  ● Security finding classification and prioritization
  ● Real-time scan and execution monitoring
  ● AI-assisted security analysis

Backend architecture
  ● `dashboard_api/` is the FastAPI backend/control plane for KING_SEARCH
  ● Current backend architecture contains approximately 51 files in the known project structure
  ● Current API architecture contains 15 major route groups and approximately 145 API endpoints according to the user's project inventory
  ● API domains include Admin, Alerts, Analytics, Authentication, Health, Input Processing, Integrations, Metrics, Progress, Reports, Results, Scans, Summary, Tools and Vulnerabilities
  ● Uses FastAPI and Pydantic
  ● Uses SQLAlchemy for persistence
  ● Contains JWT authentication and authorization architecture
  ● Contains role/permission management
  ● Contains API-key management
  ● Contains request IDs, request logging, error handling, security headers and rate limiting
  ● Supports Redis-backed distributed rate limiting
  ● Contains WebSocket architecture for scan progress, terminal/execution events and real-time communication
  ● Contains database models for users, scans, tool results, vulnerabilities, reports, alerts, audit logs and related platform entities
  ● Contains reporting and result-management APIs
  ● Contains integrations for external security/enterprise systems
  ● Backend is intended to be the stable control/API layer between the web platform and the KING_SEARCH execution engine

Backend ↔ engine integration
  ● Golden rule: only dashboard_api/integration/king_search_engine.py imports from King_Search directly. No route file, service, model, or schema anywhere else in dashboard_api/ imports King_Search — they import from `dashboard_api.integration.king_search_engine` instead.
  ● Backend should request security jobs through a controlled execution interface rather than directly coupling every API route to individual security tools
  ● KING_SEARCH execution should remain reusable independently of the web dashboard
  ● CLI and API execution should share the same core security engine while using different interaction adapters
  ● Long-running security operations should execute asynchronously through a durable job/execution architecture
  ● API lifecycle should conceptually follow request → authorization → scan → job → worker → tool orchestration → structured events → results → findings → report

Execution architecture
  ● KING_SEARCH uses asynchronous/concurrent execution concepts
  ● Tool execution is centralized through execution/orchestration layers
  ● Tool registry provides a unified representation of available tools
  ● Concurrency management controls parallel security-tool execution
  ● Resource monitoring and execution metrics are part of the architecture
  ● Progress tracking is a first-class capability
  ● Circuit-breaker/rate-limiting concepts exist in the core architecture
  ● Durable jobs are required for scalable web/API operation
  ● Execution architecture should support future worker/queue-based scaling

Data and intelligence architecture
  ● Raw security-tool output should progressively become normalized structured results
  ● Findings should contain meaningful security context such as asset, vulnerability type, severity, evidence, confidence, source, affected endpoint, timestamps and remediation context
  ● Multiple tools discovering the same issue should eventually be correlated/deduplicated
  ● Historical scan results should support security posture comparison over time
  ● Future architecture should maintain relationships between assets, technologies, services, endpoints, APIs, vulnerabilities, identities and dependencies
  ● Long-term direction includes an asset/security graph for contextual security intelligence

Real-time architecture
  ● Real-time scan visibility is a core product capability
  ● Users should be able to monitor scan state, tool execution, progress, findings, alerts and completion without page refresh
  ● WebSockets/event streaming are part of the platform architecture
  ● Structured execution events are preferred as the long-term frontend contract over arbitrary terminal-output streaming
  ● Real-time events should eventually become tenant-aware and authorization-aware

Reporting
  ● KING_SEARCH contains report-generation infrastructure
  ● Report generation should evolve from raw command output toward structured security findings
  ● Reports should support technical security teams and executive/management audiences
  ● Long-term reporting should include technical evidence, severity, risk context, remediation and historical comparison
  ● Bug-bounty-oriented reporting is also part of the platform capability set

Frontend stack
  ● React 18
  ● Next.js 14
  ● TypeScript
  ● Tailwind CSS 3
  ● Frontend is intended to be a production web dashboard over the FastAPI backend
  ● Major UI domains include authentication, dashboard, scans, live scan monitoring, tools, results, vulnerabilities, reports, alerts, analytics, integrations, settings and administration
  ● Frontend should consume real backend API contracts rather than independent mock architecture
  ● API types should ideally be generated or synchronized from the FastAPI/OpenAPI contract
  ● Frontend architecture should remain compatible with future multi-tenant SaaS operation

SaaS platform vision
  ● KING_SEARCH is intended to become a multi-tenant SaaS platform
  ● One codebase should eventually serve multiple organizations/customers
  ● Tenant-specific subdomains and custom domains are part of the long-term platform vision
  ● Organizations, users, memberships, roles, assets, scans, results, vulnerabilities, reports, alerts, integrations, API keys, usage and subscriptions should eventually be tenant-scoped
  ● Tenant isolation is a core security boundary
  ● Future commercial infrastructure may include usage limits, scan quotas, concurrency limits, API quotas, subscriptions and organization-level configuration
  ● SaaS architecture should be designed for gradual growth rather than requiring the entire platform to be rebuilt

AI architecture
  ● AI is an intelligence layer above the deterministic security engine
  ● Core scanners and security tools should remain functional without AI
  ● AI should enhance correlation, reasoning, prioritization, anomaly analysis, report generation, threat intelligence interpretation and security decision support
  ● AI provider/model integration should remain modular
  ● KING_SEARCH should avoid becoming permanently dependent on one AI vendor
  ● Long-term AI capabilities include AI Security Copilot, AI Finding Correlator, AI Risk Prioritizer, AI Attack-Surface Analyst, AI Threat Intelligence Analyst, AI Report Generator, AI Workflow Planner and AI Security Graph

Workflow automation
  ● Long-term KING_SEARCH should move from manually selecting individual tools toward reusable security workflows
  ● Example workflow: Passive Discovery → Asset Enumeration → HTTP Discovery → Technology Detection → Vulnerability Scanning → API Discovery → API Security Testing → Correlation → Risk Prioritization → Reporting
  ● Workflow profiles can eventually target bug bounty, web applications, APIs, enterprise infrastructure, cloud environments, external attack surface and specialized environments
  ● Workflow execution must remain authorization-aware and policy-controlled

Enterprise capabilities
  ● Future enterprise functionality may include SSO, advanced RBAC, organization policies, audit trails, approval workflows, scheduled scanning, asset inventories, compliance-oriented reporting, SIEM integration, SOAR integration, ticketing integration, webhooks, cloud integrations and enterprise security controls
  ● Enterprise features should be added on top of the core security engine rather than replacing it

Infrastructure
  ● Core execution environment is Python-based
  ● Backend is FastAPI-based
  ● Database layer uses SQLAlchemy
  ● Real-time communication uses WebSockets
  ● Redis is part of the scalable infrastructure direction
  ● Frontend uses Next.js 14 + React 18 + TypeScript + Tailwind CSS 3
  ● Long-term production deployment should support horizontally scalable API/worker infrastructure
  ● Long-running security operations should not depend on the lifecycle of a single HTTP request
