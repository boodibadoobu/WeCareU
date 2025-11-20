/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4ade80', // Soft green
                secondary: '#60a5fa', // Soft blue
            }
        },
    },
    plugins: [],
}
