const cloudUrl = 'https://qfqiathmkbimnhmuuibj.supabase.co/functions/v1/aura-api';

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (configuredUrl?.trim() || cloudUrl).replace(/\/+$/, '');
