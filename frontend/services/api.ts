// mettre ip locale : ipconfig getifaddr en0
export const API_BASE_URL = "http://192.168.1.84:8000/api" //"http://10.109.255.231:8000/api";
export const REDIRECT_URL ="exp://192.168.1.84:8081/callback" //"exp://10.109.255.231:8081/callback"
interface RequestOptions {
  headers?: Record<string, string>;
}

export async function uploadFile(endpoint: string, uri: string, mime: string) {
  const formData = new FormData();
  // @ts-ignore
  formData.append('file', {
    uri,
    name: uri.split('/').pop() || 'upload',
    type: mime,
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  const data = await response.json();

  if (endpoint === '/upload-audio/') {
    return data.audio_path;
  } else {
    return data.video_path;
  }
}


async function request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, undefined, options);
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, body, options);
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, body, options);
  },
  delete<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('DELETE', path, body, options);
  },

  uploadVideo(uri: string) {
    return uploadFile('/upload-video/', uri, 'video/mp4');
  },
};

export default api;

