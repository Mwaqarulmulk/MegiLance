/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  experimental: {
    optimizeUniversalDefaults: false,
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-family-heading)', 'Poppins', 'sans-serif'],
        body: ['var(--font-family-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-family-code)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--ml-blue)',
          light: 'var(--ml-blue-light)',
          dark: 'var(--ml-blue-dark)',
        },
        success: {
          DEFAULT: 'var(--ml-green)',
          light: 'var(--ml-green-light)',
          dark: 'var(--ml-green-dark)',
        },
        danger: {
          DEFAULT: 'var(--ml-red)',
          light: 'var(--ml-red-light)',
          dark: 'var(--ml-red-dark)',
        },
        warning: {
          DEFAULT: 'var(--ml-yellow)',
        },
        accent: {
          DEFAULT: 'var(--ml-orange)',
          light: 'var(--ml-orange-light)',
          dark: 'var(--ml-orange-dark)',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'focus-primary': 'var(--shadow-focus-ring-primary)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'soft-lg': '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 40px rgba(69, 115, 223, 0.06)',
        'soft-xl': '0 30px 60px rgba(0, 0, 0, 0.12), 0 0 60px rgba(69, 115, 223, 0.08)',
        'glow': '0 0 50px rgba(69, 115, 223, 0.15)',
        'glow-lg': '0 0 80px rgba(69, 115, 223, 0.2), 0 20px 50px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        sm: 'blur(4px)',
        md: 'blur(12px)',
        lg: 'blur(20px)',
        xl: 'blur(40px)',
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        glow: '0 0 10px rgba(69, 115, 223, 0.4)',
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'float-medium': 'float 3s ease-in-out infinite',
        'float-fast': 'float 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient-flow': 'gradientFlow 8s ease infinite',
        'morph': 'morph 6s ease-in-out infinite',
        // ── Premium AI kit (magic components) ──
        'border-beam': 'borderBeam calc(var(--duration,8)*1s) infinite linear',
        'shimmer-slide': 'shimmerSlide var(--speed,3s) ease-in-out infinite alternate',
        'spin-around': 'spinAround calc(var(--speed,3s)*2) infinite linear',
        'meteor': 'meteor 5s linear infinite',
        'marquee': 'marquee var(--duration,40s) linear infinite',
        'marquee-vertical': 'marqueeVertical var(--duration,40s) linear infinite',
        'aurora': 'aurora 60s linear infinite',
        'grid': 'grid 15s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'rainbow': 'rainbow var(--speed,8s) infinite linear',
        'orbit': 'orbit calc(var(--duration,20s)) linear infinite',
        'shine': 'shine var(--duration,14s) infinite linear',
        'pulse-ring': 'pulseRing 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 0px rgba(69, 115, 223, 0))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 15px rgba(69, 115, 223, 0.6))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        morph: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
        },
        // ── Premium AI kit (magic components) ──
        borderBeam: {
          '100%': { offsetDistance: '100%' },
        },
        shimmerSlide: {
          to: { transform: 'translate(calc(100cqw - 100%), 0)' },
        },
        spinAround: {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap,1rem)))' },
        },
        marqueeVertical: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap,1rem)))' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%', transform: 'rotate(-5deg) scale(0.9)' },
          '25%': { backgroundPosition: '50% 100%', transform: 'rotate(5deg) scale(1.1)' },
          '50%': { backgroundPosition: '100% 50%', transform: 'rotate(-3deg) scale(0.95)' },
          '75%': { backgroundPosition: '50% 0%', transform: 'rotate(3deg) scale(1.05)' },
          '100%': { backgroundPosition: '0% 50%', transform: 'rotate(-5deg) scale(0.9)' },
        },
        grid: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        rainbow: {
          '0%': { backgroundPosition: '0%' },
          '100%': { backgroundPosition: '200%' },
        },
        orbit: {
          '0%': { transform: 'rotate(calc(var(--angle,0)*1deg)) translateY(calc(var(--radius,80)*1px)) rotate(calc(var(--angle,0)*-1deg))' },
          '100%': { transform: 'rotate(calc(var(--angle,0)*1deg + 360deg)) translateY(calc(var(--radius,80)*1px)) rotate(calc((var(--angle,0)*-1deg) - 360deg))' },
        },
        shine: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          to: { backgroundPosition: '0% 0%' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}