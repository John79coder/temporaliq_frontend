/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                apple: {
                    background: '#FBFBFD',
                    surface: '#FFFFFF',
                    gray: {
                        1: '#86868B',
                        2: '#515154',
                        3: '#1D1D1F',
                    },
                    blue: '#0071E3',
                    'blue-hover': '#0077ED',
                },
                notion: {
                    bg: '#FFFFFF',
                    surface: '#F7F7F5',
                    'surface-hover': '#EFEFED',
                    border: '#E9E9E7',
                    text: '#37352F',
                    'text-secondary': '#787774',
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Inter', 'sans-serif'],
            },
            animation: {
                'spring': 'spring-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'slide-in': 'slide-in 0.2s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
            },
            keyframes: {
                'spring-bounce': {
                    '0%': { transform: 'scale(1)' },
                    '30%': { transform: 'scale(1.05)' },
                    '60%': { transform: 'scale(0.98)' },
                    '100%': { transform: 'scale(1)' },
                },
                'slide-in': {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            screens: {
                'xs': '390px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
