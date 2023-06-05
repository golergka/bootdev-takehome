module.exports = {
  content: ["./layouts/**/*.{html,js}"],
  theme: {
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};
