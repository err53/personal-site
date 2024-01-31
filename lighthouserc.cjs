module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      startServerCommand: "NODE_ENV=production pnpm run start",
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
        "total-byte-weight": "warn",
      },
    },
  },
};
