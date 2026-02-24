// Helper to get colors for different card categories (secteurs)

export type CategoryTheme = {
    bg: string;
    text: string;
    border?: string;
    icon?: string;
};

// Based on the 10 categories identified in the data
export const getCategoryTheme = (category: string): CategoryTheme => {
    const normalized = category.toLowerCase().trim();

    switch (normalized) {
        case 'sécurité':
            return { bg: '#991B1B', text: '#FEE2E2', border: '#7F1D1D', icon: 'shield-checkmark' }; // Deep Red
        case 'environnement':
            return { bg: '#166534', text: '#DCFCE7', border: '#14532D', icon: 'leaf' }; // Deep Green
        case 'urbanisme':
            return { bg: '#374151', text: '#F3F4F6', border: '#1F2937', icon: 'business' }; // Dark Gray
        case 'transports':
            return { bg: '#1E40AF', text: '#DBEAFE', border: '#1E3A8A', icon: 'bus' }; // Deep Blue
        case 'éducation':
            return { bg: '#B45309', text: '#FEF3C7', border: '#92400E', icon: 'school' }; // Deep Amber/Orange
        case 'social':
            return { bg: '#9D174D', text: '#FCE7F3', border: '#831843', icon: 'people' }; // Deep Pink
        case 'logement':
            return { bg: '#0F766E', text: '#CCFBF1', border: '#115E59', icon: 'home' }; // Deep Teal
        case 'économie':
            return { bg: '#A16207', text: '#FEF08A', border: '#854D0E', icon: 'briefcase' }; // Deep Gold
        case 'budget':
            return { bg: '#047857', text: '#D1FAE5', border: '#065F46', icon: 'cash' }; // Deep Mint/Emerald
        case 'culture & sport':
            return { bg: '#6D28D9', text: '#F3E8FF', border: '#5B21B6', icon: 'basketball' }; // Deep Purple
        default:
            return { bg: '#334155', text: '#F1F5F9', border: '#1E293B', icon: 'information-circle' }; // Dark Slate (Fallback)
    }
};
