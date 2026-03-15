import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'kala-lilac',
    primaryShade: { light: 5, dark: 4 },
    colors: {
        // KALA Brand Colors — Lilac Palette (WCAG 2.1 compliant)
        // Light mode primary: #9775FA | Dark mode accent: #B39DDB
        'kala-lilac': [
            '#F8F7FF', // 0 - Subtle BG (light mode app background)
            '#F3E5F5', // 1 - Soft background
            '#D6C6FF', // 2 - Dark mode glow accent
            '#C3AEF5', // 3 - Light mode soft primary (use dark text!)
            '#B39DDB', // 4 - Dark mode primary (primaryShade.dark)
            '#9775FA', // 5 - Action/CTA (primaryShade.light)
            '#7C5CE7', // 6 - MAIN BRAND COLOR
            '#7048E8', // 7 - Safe for white text in dark mode
            '#5E35B1', // 8 - Dark lilac (icons/text)
            '#4527A0', // 9 - Deep violet (headings)
        ],
        // Secondary: Complementary warm violet
        'kala-violet': [
            '#f3f0ff',
            '#e5dbff',
            '#d0bfff',
            '#b197fc',
            '#9775fa',
            '#845ef7',
            '#7950f2', // 6
            '#7048e8',
            '#6741d9',
            '#5f3dc4',
        ],
        // Accent: Mint green (complementary to lilac — Fresh & Organic)
        'kala-accent': [
            '#e6fcf5',
            '#c3fae8',
            '#96f2d7',
            '#63e6be',
            '#38d9a9',
            '#20c997',
            '#12b886', // 6
            '#0ca678',
            '#099268',
            '#087f5b',
        ],
        // Obsidian Text #1B263B
        'kala-dark': [
            '#f3f4f7',
            '#e7e8ec',
            '#cdd0d8',
            '#b1b6c4',
            '#989eb2',
            '#868ea3',
            '#7a849b',
            '#677087',
            '#5a6279', // 8
            '#1b263b', // 9 - MAIN DARK TEXT
        ],
    },
    fontFamily: 'Inter, sans-serif',
    defaultRadius: 'xl', // "Bento" rounded look (20px)

    // Component defaults
    components: {
        Button: {
            defaultProps: {
                radius: 'xl',
            },
        },
        Card: {
            defaultProps: {
                radius: 'xl',
                padding: 'md',
                withBorder: true,
            },
        },
        Paper: {
            defaultProps: {
                radius: 'xl',
            },
        },
    },
});
