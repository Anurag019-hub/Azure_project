/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            /* ── Colour system ── */
            colors: {
                primary: {
                    DEFAULT: '#6366F1',
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#5B5FEF',
                    700: '#4F46E5',
                    800: '#4338CA',
                    900: '#3730A3',
                    950: '#1E1B4B',
                },
                accent: {
                    DEFAULT: '#22D3EE',
                    50: '#ECFEFF',
                    100: '#CFFAFE',
                    200: '#A5F3FC',
                    300: '#67E8F9',
                    400: '#22D3EE',
                    500: '#06B6D4',
                    600: '#0891B2',
                },
                surface: {
                    DEFAULT: '#0F172A',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                },
            },

            /* ── Typography ── */
            fontFamily: {
                heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
                body: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
            },

            /* ── Border radius ── */
            borderRadius: {
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px',
            },

            /* ── Shadows ── */
            boxShadow: {
                'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.3)',
                'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
                'glow-lg': '0 0 50px -12px rgba(99, 102, 241, 0.5)',
                'glow-accent': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
                glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },

            /* ── Backdrop blur ── */
            backdropBlur: {
                xs: '2px',
                '2xl': '40px',
                '3xl': '64px',
            },

            /* ── Keyframes ── */
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-30px) rotate(5deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'border-dance': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },

            /* ── Animations ── */
            animation: {
                float: 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 8s ease-in-out infinite',
                'float-delayed': 'float 7s ease-in-out 2s infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 8s ease infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                'border-dance': 'border-dance 4s ease infinite',
            },
        },
    },
    plugins: [],
};
