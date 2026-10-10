export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api', // ← غيّره وقت النشر
  whatsappNumber: '201008150149',
} as const;

export type Environment = typeof environment;
