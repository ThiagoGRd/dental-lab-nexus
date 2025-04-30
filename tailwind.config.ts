
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				dentalblue: {
					50: '#EBF5FF',
					100: '#D1E9FF',
					200: '#A6D4FF',
					300: '#7AC0FF',
					400: '#4DACFF',
					500: '#2196F3',
					600: '#0D82E0',
					700: '#0667B4',
					800: '#044F89',
					900: '#02345C',
				},
				protechblue: {
					50: '#E6F1FF',
					100: '#CCE4FF',
					200: '#99C8FF',
					300: '#66ADFF',
					400: '#3391FF',
					500: '#0066CC',
					600: '#0052A3',
					700: '#003D7A',
					800: '#002952',
					900: '#001429',
				},
				darkblue: {
					50: '#E3F2FD',
					100: '#BBDEFB',
					200: '#90CAF9',
					300: '#64B5F6',
					400: '#42A5F5',
					500: '#1A1F2C',
					600: '#1565C0',
					700: '#0D47A1',
					800: '#0A2351',
					900: '#051937',
				},
				// Adicionando novas cores modernas
				modern: {
					primary: '#6366F1',  // Indigo
					secondary: '#8B5CF6', // Violet
					tertiary: '#EC4899',  // Pink
					info: '#0EA5E9',      // Sky blue
					success: '#10B981',   // Emerald
					warning: '#F59E0B',   // Amber
					danger: '#EF4444',    // Red
					light: '#F9FAFB',     // Gray 50
					dark: '#111827',      // Gray 900
					muted: '#6B7280',     // Gray 500
				},
				gradient: {
					start: '#6366F1',     // Indigo
					mid: '#8B5CF6',       // Violet
					end: '#EC4899',       // Pink
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0'
					},
					to: {
						opacity: '1'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			},
			boxShadow: {
				'soft': '0 4px 15px 0 rgba(0, 0, 0, 0.05)',
				'modern': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
				'glow': '0 0 15px rgba(99, 102, 241, 0.5)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
