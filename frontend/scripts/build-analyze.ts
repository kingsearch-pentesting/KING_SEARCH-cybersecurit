/**
 * Build Analyzer Script
 * 
 * Per Section 8.13: Wraps the Next.js bundle analyzer — output only, must not
 * alter build behavior when not explicitly invoked.
 * 
 * This script provides bundle analysis capabilities to help identify:
 * - Large dependencies
 * - Duplicate code
 * - Optimization opportunities
 * - Bundle size changes over time
 * 
 * Usage:
 *   npm run build:analyze
 *   node scripts/build-analyze.ts
 * 
 * The script does NOT modify the build process itself - it only provides
 * analysis output when explicitly invoked.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const PROJECT_ROOT = path.join(process.cwd(), '..');
const ANALYSIS_OUTPUT_DIR = path.join(PROJECT_ROOT, '.next', 'analyze');
const REPORT_FILE = path.join(ANALYSIS_OUTPUT_DIR, 'bundle-report.html');

interface BundleAnalysisOptions {
  openReport?: boolean;
  format?: 'html' | 'json';
  verbose?: boolean;
}

/**
 * Check if @next/bundle-analyzer is installed
 */
function checkBundleAnalyzerInstalled(): boolean {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const isInstalled = 
    packageJson.devDependencies?.['@next/bundle-analyzer'] ||
    packageJson.dependencies?.['@next/bundle-analyzer'];

  if (!isInstalled) {
    console.log('⚠ @next/bundle-analyzer is not installed.');
    console.log('Install it with: npm install --save-dev @next/bundle-analyzer');
    return false;
  }

  return true;
}

/**
 * Check if next.config.js has bundle analyzer configuration
 */
function checkNextConfig(): boolean {
  const nextConfigPath = path.join(PROJECT_ROOT, 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.log('⚠ next.config.js not found');
    return false;
  }

  const configContent = fs.readFileSync(nextConfigPath, 'utf-8');
  const hasBundleAnalyzer = configContent.includes('@next/bundle-analyzer');

  if (!hasBundleAnalyzer) {
    console.log('⚠ Bundle analyzer is not configured in next.config.js');
    console.log('Add the following to your next.config.js:');
    console.log(`
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your existing next.js config
});
    `);
    return false;
  }

  return true;
}

/**
 * Run the build with bundle analysis enabled
 */
function runAnalyzedBuild(options: BundleAnalysisOptions): void {
  console.log('='.repeat(60));
  console.log('Next.js Bundle Analyzer');
  console.log('='.repeat(60));
  console.log('');

  // Check prerequisites
  if (!checkBundleAnalyzerInstalled()) {
    process.exit(1);
  }

  if (!checkNextConfig()) {
    process.exit(1);
  }

  console.log('✓ Prerequisites checked');
  console.log('');
  console.log('Running production build with bundle analysis...');
  console.log('');

  try {
    // Set environment variable to enable analyzer
    process.env.ANALYZE = 'true';

    // Run the build
    const buildCommand = 'npm run build';
    const buildOutput = execSync(buildCommand, {
      cwd: PROJECT_ROOT,
      stdio: options.verbose ? 'inherit' : 'pipe',
      encoding: 'utf-8',
    });

    if (!options.verbose) {
      console.log(buildOutput);
    }

    console.log('');
    console.log('✓ Build completed successfully');
    console.log('');

    // Check if report was generated
    if (fs.existsSync(REPORT_FILE)) {
      console.log(`✓ Bundle report generated: ${REPORT_FILE}`);
      
      if (options.openReport !== false) {
        console.log('');
        console.log('Opening bundle report in browser...');
        openReportInBrowser(REPORT_FILE);
      }
    } else {
      console.log('⚠ Bundle report not found at expected location');
      console.log(`Expected: ${REPORT_FILE}`);
    }

  } catch (error) {
    console.error('');
    console.error('✗ Build failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Open the HTML report in the default browser
 */
function openReportInBrowser(reportPath: string): void {
  const platform = process.platform;
  let command: string;

  switch (platform) {
    case 'darwin': // macOS
      command = `open "${reportPath}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${reportPath}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${reportPath}"`;
      break;
  }

  try {
    execSync(command, { stdio: 'ignore' });
    console.log('✓ Report opened in browser');
  } catch (error) {
    console.log('⚠ Could not open report automatically');
    console.log(`Open manually: file://${reportPath}`);
  }
}

/**
 * Generate a summary of the analysis
 */
function generateAnalysisSummary(): void {
  console.log('');
  console.log('='.repeat(60));
  console.log('Bundle Analysis Summary');
  console.log('='.repeat(60));
  console.log('');
  console.log('Key metrics to review:');
  console.log('1. Initial bundle size (JS/CSS)');
  console.log('2. Page-specific bundle sizes');
  console.log('3. Dependency sizes');
  console.log('4. Duplicate modules');
  console.log('5. Tree-shaking effectiveness');
  console.log('');
  console.log('Optimization tips:');
  console.log('- Use dynamic imports for large components');
  console.log('- Remove unused dependencies');
  console.log('- Enable compression (gzip/brotli)');
  console.log('- Consider code splitting by route');
  console.log('- Review third-party library alternatives');
  console.log('');
}

/**
 * Clean up analysis artifacts
 */
function cleanupAnalysis(): void {
  console.log('Cleaning up analysis artifacts...');
  
  try {
    if (fs.existsSync(ANALYSIS_OUTPUT_DIR)) {
      fs.rmSync(ANALYSIS_OUTPUT_DIR, { recursive: true, force: true });
      console.log('✓ Analysis artifacts cleaned up');
    } else {
      console.log('No analysis artifacts to clean up');
    }
  } catch (error) {
    console.log('⚠ Could not clean up analysis artifacts:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Main execution
 */
async function main(options: BundleAnalysisOptions = {}): Promise<void> {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--no-open':
        options.openReport = false;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--cleanup':
        cleanupAnalysis();
        process.exit(0);
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

  runAnalyzedBuild(options);
  generateAnalysisSummary();
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log('');
  console.log('Next.js Bundle Analyzer');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/build-analyze.ts [options]');
  console.log('  npm run build:analyze [options]');
  console.log('');
  console.log('Options:');
  console.log('  --no-open       Do not open the report in browser automatically');
  console.log('  --verbose, -v   Show verbose build output');
  console.log('  --cleanup       Clean up analysis artifacts');
  console.log('  --help, -h      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/build-analyze.ts              # Run analysis and open report');
  console.log('  node scripts/build-analyze.ts --no-open     # Run analysis without opening');
  console.log('  node scripts/build-analyze.ts --verbose     # Run with verbose output');
  console.log('  node scripts/build-analyze.ts --cleanup     # Clean up artifacts');
  console.log('');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as analyzeBuild };
export { cleanupAnalysis };
export { generateAnalysisSummary };
