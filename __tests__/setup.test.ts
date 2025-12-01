/**
 * Basic test to verify Jest setup is working
 */
describe('Jest Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have global fetch mock', () => {
    expect(global.fetch).toBeDefined();
    expect(typeof global.fetch).toBe('function');
  });

  it('should have React Native mocks available', () => {
    // This test just verifies that we can run without crashes
    expect(true).toBe(true);
  });
});