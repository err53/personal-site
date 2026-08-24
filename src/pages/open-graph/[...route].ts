import sharp from "sharp";
import { OGImageRoute } from "astro-og-canvas";

const logoPath = ".astro/open-graph-logo.png";
await sharp("public/logo.svg").resize(120, 120).png().toFile(logoPath);

const pages = {
  home: {
    title: "Jason Huang",
    description:
      "Full-Stack Developer · Open-Knowledge Advocate · React · Node.js · Python · C++",
  },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    logo: {
      path: logoPath,
      size: [120, 120],
    },
    description: page.description,
    bgGradient: [
      [250, 250, 250],
      [255, 255, 255],
    ],
    padding: 84,
    font: {
      title: {
        color: [0, 0, 0],
        size: 88,
      },
      description: {
        color: [64, 64, 64],
        size: 40,
        lineHeight: 1.35,
      },
    },
  }),
});
