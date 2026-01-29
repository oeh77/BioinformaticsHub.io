/**
 * Simple Testing Utilities
 * Basic test helpers for manual and automated testing
 */

export class TestHelper {
  private static results: { name: string; passed: boolean; error?: string }[] = [];

  /**
   * Assert that a condition is true
   */
  static assert(condition: boolean, message: string) {
    if (!condition) {
      const error = `Assertion failed: ${message}`;
      this.results.push({ name: message, passed: false, error });
      throw new Error(error);
    }
    this.results.push({ name: message, passed: true });
  }

  /**
   * Assert equality
   */
  static assertEqual<T>(actual: T, expected: T, message: string) {
    const passed = actual === expected;
    if (!passed) {
      const error = `Expected ${expected}, got ${actual}`;
      this.results.push({ name: message, passed: false, error });
      throw new Error(`${message}: ${error}`);
    }
    this.results.push({ name: message, passed: true });
  }

  /**
   * Assert deep equality for objects
   */
  static assertDeepEqual(actual: unknown, expected: unknown, message: string) {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    if (!passed) {
      const error = `Objects don't match`;
      this.results.push({ name: message, passed: false, error });
      throw new Error(`${message}: ${error}`);
    }
    this.results.push({ name: message, passed: true });
  }

  /**
   * Test API endpoint
   */
  static async testAPI(
    name: string,
    url: string,
    options?: RequestInit,
    expectedStatus = 200
  ) {
    try {
      const response = await fetch(url, options);
      const passed = response.status === expectedStatus;
      
      if (!passed) {
        const error = `Expected status ${expectedStatus}, got ${response.status}`;
        this.results.push({ name, passed: false, error });
        return { passed: false, response, error };
      }

      this.results.push({ name, passed: true });
      return { passed: true, response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({ name, passed: false, error: errorMessage });
      return { passed: false, error: errorMessage };
    }
  }

  /**
   * Run a test function
   */
  static async test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(error);
    }
  }

  /**
   * Get test results
   */
  static getResults() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      results: this.results,
    };
  }

  /**
   * Print test summary
   */
  static printSummary() {
    const { total, passed, failed, passRate } = this.getResults();
    
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
    console.log('='.repeat(50) + '\n');

    if (failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  ❌ ${r.name}: ${r.error}`);
        });
    }
  }

  /**
   * Reset test results
   */
  static reset() {
    this.results = [];
  }
}

/**
 * Performance testing utility
 */
export class PerformanceTest {
  private static measurements: Map<string, number[]> = new Map();

  static async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
    };
  }

  static printStats() {
    console.log('\n' + '='.repeat(50));
    console.log('PERFORMANCE STATS');
    console.log('='.repeat(50));
    
    this.measurements.forEach((_, name) => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`\n${name}:`);
        console.log(`  Count: ${stats.count}`);
        console.log(`  Min: ${stats.min.toFixed(2)}ms`);
        console.log(`  Max: ${stats.max.toFixed(2)}ms`);
        console.log(`  Avg: ${stats.avg.toFixed(2)}ms`);
        console.log(`  Median: ${stats.median.toFixed(2)}ms`);
      }
    });
    console.log('\n' + '='.repeat(50) + '\n');
  }

  static reset() {
    this.measurements.clear();
  }
}

// Example usage in comments
/*
// Basic assertions
TestHelper.test('User can create post', () => {
  const post = { title: 'Test', content: 'Content' };
  TestHelper.assert(post.title.length > 0, 'Post has title');
  TestHelper.assertEqual(post.title, 'Test', 'Title matches');
});

// API testing
await TestHelper.testAPI('Get tools', '/api/admin/tools', {
  headers: { 'Content-Type': 'application/json' }
});

// Performance testing
await PerformanceTest.measure('Load tools', async () => {
  const response = await fetch('/api/admin/tools');
  return response.json();
});

// Print results
TestHelper.printSummary();
PerformanceTest.printStats();
*/
