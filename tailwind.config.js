/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['selector', '[data-mode="always-dark"]'], // Force disabling by using a non-existent selector
    theme: {
        extend: {},
    },
    plugins: [],
}
