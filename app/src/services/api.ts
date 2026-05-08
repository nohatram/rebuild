import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

async function authHeader(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  sendCode: (phone: string) =>
    request<{ message: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyCode: (phone: string, code: string) =>
    request<{ token: string; user: object }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  chat: (message: string, currentWorkout?: string) =>
    request<{ reply: string; workoutUpdate?: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, currentWorkout }),
    }),

  logSession: (workoutText: string) =>
    request<{ session: object }>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ workoutText, status: 'logged' }),
    }),

  getSessions: (page = 1) =>
    request<{ sessions: object[]; total: number }>(`/sessions?page=${page}`),

  getWeightHistory: () =>
    request<{ entries: Array<{ date: string; weight: number }> }>('/user/weight'),

  logWeight: (weightLbs: number) =>
    request<{ entry: object }>('/user/weight', {
      method: 'POST',
      body: JSON.stringify({ weightLbs }),
    }),

  uploadPhoto: (uri: string, date: string) => {
    const form = new FormData();
    form.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' } as unknown as Blob);
    form.append('date', date);
    return request<{ photo: object }>('/photos', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPhotos: () =>
    request<{ photos: object[] }>('/photos'),

  getVolumeStats: () =>
    request<{ muscles: Array<{ name: string; sets: number }> }>('/stats/volume'),
};
