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
      target: "lhci",
      serverBaseUrl: "https://lhci.huang.ovh/",
      token: "bd6846df-18bf-4e63-8253-43d6dffa50e6",
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        "csp-xss": "off",
      },
    },
  },
};
