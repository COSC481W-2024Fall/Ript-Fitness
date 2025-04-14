// Import the actual Animated module to preserve original functionality for unmocked parts
const actual = jest.requireActual('react-native/Libraries/Animated/Animated');

module.exports = {
  // Spread all original exports (e.g., Animated.spring, decay, etc.)
  ...actual,

  // Keep the original Animated.Value constructor (used in most animated components)
  Value: actual.Value,

  /**
   * Mock implementation of Animated.timing
   * Simulates instantly reaching the target value and calls the callback immediately.
   * This bypasses the animation delay so your tests can run synchronously.
   */
  timing: (value, config) => ({
    start: (callback) => {
      value.setValue(config.toValue);         // Immediately apply the final value
      callback?.({ finished: true });         // Simulate animation completion
    },
  }),

  /**
   * Mock implementation of Animated.parallel
   * Starts all animations in the array and immediately triggers the final callback.
   */
  parallel: (animations) => ({
    start: (callback) => {
      animations.forEach(anim => anim.start?.()); // Call each animation's start
      callback?.({ finished: true });             // Notify the group animation is "done"
    },
  }),

  /**
   * Mock implementation of Animated.sequence
   * Runs animations one after another using promise chaining.
   */
  sequence: (animations) => ({
    start: (callback) => {
      animations.reduce(
        (p, anim) => p.then(() => new Promise(resolve => anim.start(resolve))), // Chain .start calls
        Promise.resolve()
      ).then(() => callback?.({ finished: true })); // Final callback after sequence finishes
    },
  }),

  /**
   * Mock implementation of Animated.loop
   * For testing purposes, we avoid actually looping and just return stub methods.
   */
  loop: (animation) => ({
    start: () => ({ stop: jest.fn() }), // Return a mocked loop interface
  }),
};
