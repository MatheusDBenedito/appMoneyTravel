/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Establish an impossible selector to disable dark mode
    darkMode: ['selector', '[data-mode="always-dark"]'],
    theme: {
        extend: {},
    },
    plugins: [],
}
