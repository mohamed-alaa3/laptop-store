export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  whatsappNumber: '201008150149', // ← غيّره لرقمك
} as const;

export type Environment = typeof environment;
