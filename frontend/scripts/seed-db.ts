/**
 * Database Seeding Script
 * 
 * Per Section 8.13: Backend-adjacent convenience script, not part of the frontend
 * runtime — must never be imported by any src/ file.
 * 
 * This script provides a convenient way to seed the backend database with initial
 * data for development and testing purposes. It interacts with the dashboard_api
 * endpoints to create test users, scans, and other data.
 * 
 * Usage:
 *   npm run seed-db
 *   node scripts/seed-db.ts
 * 
 * IMPORTANT: This script is for development/testing only. Never run this in
 * production environments.
 * 
 * WARNING: This script may modify or delete existing data. Use with caution.
 */

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin123';

// Seed data configuration
interface SeedConfig {
  createUsers: boolean;
  createScans: boolean;
  createVulnerabilities: boolean;
  createReports: boolean;
  createAlerts: boolean;
  userCount: number;
  scanCount: number;
}

const DEFAULT_SEED_CONFIG: SeedConfig = {
  createUsers: true,
  createScans: true,
  createVulnerabilities: true,
  createReports: true,
  createAlerts: true,
  userCount: 5,
  scanCount: 10,
};

// Mock data generators
const ROLES = ['admin', 'analyst', 'operator', 'viewer', 'guest'];
const SCAN_STATUSES = ['draft', 'pending', 'queued', 'starting', 'running', 'paused', 'resuming', 'completed', 'failed', 'cancelled'];
const SEVERITY_LEVELS = ['critical', 'high', 'medium', 'low', 'info', 'unknown'];
const TARGETS = [
  'example.com',
  'test.example.org',
  'demo.test.net',
  '192.168.1.1',
  '10.0.0.1',
];

class DatabaseSeeder {
  private authToken: string | null = null;
  private config: SeedConfig;

  constructor(config: Partial<SeedConfig> = {}) {
    this.config = { ...DEFAULT_SEED_CONFIG, ...config };
  }

  /**
   * Authenticate with the backend API
   */
  private async authenticate(): Promise<void> {
    console.log('Authenticating with backend API...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { access_token: string };
      this.authToken = data.access_token;
      console.log('✓ Authentication successful');
    } catch (error) {
      console.error('✗ Authentication failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generate random user data
   */
  private generateUserData(index: number): any {
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    return {
      username: `user${index}`,
      email: `user${index}@example.com`,
      full_name: `Test User ${index}`,
      password: `password${index}`,
      role: role,
      is_active: true,
    };
  }

  /**
   * Generate random scan data
   */
  private generateScanData(index: number): any {
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const status = SCAN_STATUSES[Math.floor(Math.random() * SCAN_STATUSES.length)];
    
    return {
      name: `Test Scan ${index}`,
      description: `Automated test scan ${index}`,
      targets: [target],
      selected_tools: ['nmap', 'nuclei'],
      categories: [],
      bundles: [],
      priority: 'medium',
      concurrency: 5,
      timeout_seconds: 3600,
      run_all_tools: false,
      status: status,
    };
  }

  /**
   * Generate random vulnerability data
   */
  private generateVulnerabilityData(scanId: string, index: number): any {
    const severity = SEVERITY_LEVELS[Math.floor(Math.random() * SEVERITY_LEVELS.length)];
    
    return {
      scan_id: scanId,
      title: `Test Vulnerability ${index}`,
      description: `This is a test vulnerability ${index}`,
      severity: severity,
      cvss_score: Math.random() * 10,
      cve_id: `CVE-2024-${1000 + index}`,
      status: 'open',
      tool_name: 'nuclei',
      affected_component: `target-${index}.example.com`,
      remediation: 'Apply security patch',
      references: ['https://example.com/ref'],
    };
  }

  /**
   * Seed users
   */
  private async seedUsers(): Promise<void> {
    if (!this.config.createUsers) {
      console.log('⊘ Skipping user creation');
      return;
    }

    console.log(`Creating ${this.config.userCount} test users...`);

    for (let i = 1; i <= this.config.userCount; i++) {
      try {
        const userData = this.generateUserData(i);
        await this.apiRequest('/api/v1/admin/users', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        console.log(`✓ Created user: ${userData.username}`);
      } catch (error) {
        console.log(`⚠️  Failed to create user ${i}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Seed scans
   */
  private async seedScans(): Promise<string[]> {
    if (!this.config.createScans) {
      console.log('⊘ Skipping scan creation');
      return [];
    }

    console.log(`Creating ${this.config.scanCount} test scans...`);
    const scanIds: string[] = [];

    for (let i = 1; i <= this.config.scanCount; i++) {
      try {
        const scanData = this.generateScanData(i);
        const scan = await this.apiRequest('/api/v1/scans', {
          method: 'POST',
          body: JSON.stringify(scanData),
        });
        scanIds.push(scan.id);
        console.log(`✓ Created scan: ${scan.name} (${scan.id})`);
      } catch (error) {
        console.log(`⚠️  Failed to create scan ${i}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return scanIds;
  }

  /**
   * Seed vulnerabilities
   */
  private async seedVulnerabilities(scanIds: string[]): Promise<void> {
    if (!this.config.createVulnerabilities || scanIds.length === 0) {
      console.log('⊘ Skipping vulnerability creation');
      return;
    }

    console.log('Creating test vulnerabilities...');

    for (const scanId of scanIds) {
      const vulnCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 1; i <= vulnCount; i++) {
        try {
          const vulnData = this.generateVulnerabilityData(scanId, i);
          await this.apiRequest('/api/v1/vulnerabilities', {
            method: 'POST',
            body: JSON.stringify(vulnData),
          });
        } catch (error) {
          console.log(`⚠️  Failed to create vulnerability for scan ${scanId}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }

    console.log('✓ Vulnerabilities created');
  }

  /**
   * Seed reports
   */
  private async seedReports(scanIds: string[]): Promise<void> {
    if (!this.config.createReports || scanIds.length === 0) {
      console.log('⊘ Skipping report creation');
      return;
    }

    console.log('Creating test reports...');

    for (const scanId of scanIds.slice(0, 3)) {
      try {
        const reportData = {
          name: `Report for scan ${scanId}`,
          description: 'Automated test report',
          scan_id: scanId,
          format: 'pdf',
          include_summary: true,
          include_vulnerabilities: true,
          include_recommendations: true,
        };
        
        await this.apiRequest('/api/v1/reports', {
          method: 'POST',
          body: JSON.stringify(reportData),
        });
        console.log(`✓ Created report for scan ${scanId}`);
      } catch (error) {
        console.log(`⚠️  Failed to create report for scan ${scanId}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Seed alerts
   */
  private async seedAlerts(): Promise<void> {
    if (!this.config.createAlerts) {
      console.log('⊘ Skipping alert creation');
      return;
    }

    console.log('Creating test alerts...');

    const alertRules = [
      {
        name: 'Critical Vulnerability Alert',
        description: 'Alert when critical vulnerabilities are found',
        condition: 'severity == "critical"',
        action: 'email',
        enabled: true,
      },
      {
        name: 'High Severity Alert',
        description: 'Alert when high severity vulnerabilities are found',
        condition: 'severity == "high"',
        action: 'notification',
        enabled: true,
      },
    ];

    for (const rule of alertRules) {
      try {
        await this.apiRequest('/api/v1/alerts/rules', {
          method: 'POST',
          body: JSON.stringify(rule),
        });
        console.log(`✓ Created alert rule: ${rule.name}`);
      } catch (error) {
        console.log(`⚠️  Failed to create alert rule ${rule.name}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Run the complete seeding process
   */
  async seed(): Promise<void> {
    console.log('='.repeat(60));
    console.log('Database Seeding Script');
    console.log('='.repeat(60));
    console.log('');
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Configuration: ${JSON.stringify(this.config, null, 2)}`);
    console.log('');
    console.log('⚠️  WARNING: This script will modify database data.');
    console.log('    Use with caution and never in production!');
    console.log('');

    try {
      await this.authenticate();
      await this.seedUsers();
      const scanIds = await this.seedScans();
      await this.seedVulnerabilities(scanIds);
      await this.seedReports(scanIds);
      await this.seedAlerts();

      console.log('');
      console.log('='.repeat(60));
      console.log('✓ Database seeding completed successfully');
      console.log('='.repeat(60));
    } catch (error) {
      console.error('');
      console.error('✗ Database seeding failed:', error instanceof Error ? error.message : String(error));
      console.error('');
      console.error('Troubleshooting:');
      console.error('- Ensure dashboard_api is running');
      console.error('- Check that admin credentials are correct');
      console.error('- Verify API_BASE_URL is accessible');
      process.exit(1);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): Partial<SeedConfig> {
  const args = process.argv.slice(2);
  const config: Partial<SeedConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--no-users':
        config.createUsers = false;
        break;
      case '--no-scans':
        config.createScans = false;
        break;
      case '--no-vulnerabilities':
        config.createVulnerabilities = false;
        break;
      case '--no-reports':
        config.createReports = false;
        break;
      case '--no-alerts':
        config.createAlerts = false;
        break;
      case '--user-count':
        config.userCount = parseInt(args[++i], 10);
        break;
      case '--scan-count':
        config.scanCount = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        console.log(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return config;
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log('');
  console.log('Database Seeding Script');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/seed-db.ts [options]');
  console.log('  npm run seed-db [options]');
  console.log('');
  console.log('Options:');
  console.log('  --no-users              Skip user creation');
  console.log('  --no-scans              Skip scan creation');
  console.log('  --no-vulnerabilities    Skip vulnerability creation');
  console.log('  --no-reports            Skip report creation');
  console.log('  --no-alerts             Skip alert creation');
  console.log('  --user-count <n>        Number of users to create (default: 5)');
  console.log('  --scan-count <n>        Number of scans to create (default: 10)');
  console.log('  --help, -h              Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  NEXT_PUBLIC_API_BASE_URL   Backend API URL (default: http://localhost:8001)');
  console.log('  SEED_ADMIN_USERNAME       Admin username (default: admin)');
  console.log('  SEED_ADMIN_PASSWORD       Admin password (default: admin123)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/seed-db.ts                    # Seed with default config');
  console.log('  node scripts/seed-db.ts --no-users         # Skip user creation');
  console.log('  node scripts/seed-db.ts --user-count 10    # Create 10 users');
  console.log('  node scripts/seed-db.ts --scan-count 20    # Create 20 scans');
  console.log('');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const config = parseArgs();
  const seeder = new DatabaseSeeder(config);
  await seeder.seed();
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { DatabaseSeeder };
export { main as seedDb };
