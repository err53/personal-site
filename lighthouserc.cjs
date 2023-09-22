module.exports = {
  ci: {
    collect: {
      numberOfRuns: 5,
      settings: {
        throttling: {
          cpuSlowdownMultiplier: 2.5,
        },
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        // currently broken when running headless, so skip assertion
        // see: https://github.com/GoogleChrome/lighthouse/issues/14784
        "bf-cache": "off",
        // don't think it's possible to properly evaluate csp either
        "csp-xss": ["off"],
      },
    },
  },
};
