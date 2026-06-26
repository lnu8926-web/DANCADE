import type { Preview } from "@storybook/nextjs";
import { createElement } from "react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "DANCADE",
      values: [
        { name: "DANCADE", value: "#1a1a2e" },
        { name: "Arcade Black", value: "#050509" },
        { name: "Light", value: "#ffffff" },
      ],
    },
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      createElement("div", { className: "font-neo text-white" }, createElement(Story))
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
