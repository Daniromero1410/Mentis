const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // No establecer Content-Type para FormData, el navegador lo hace automáticamente

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T | void> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de conexión' }));
      throw new Error(error.detail || 'Error en la petición');
    }
    // 204 No Content responses don't have a body
    if (response.status === 204) {
      return;
    }
    return response.json();
  }

  async downloadFile(endpoint: string, filename: string, viewInNewTab: boolean = false): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay sesión activa. Por favor inicie sesión.');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error al descargar' }));
      throw new Error(error.detail || 'Error al descargar');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    if (viewInNewTab) {
      window.open(url, '_blank');
      // Note: We can't revoke object URL immediately for new tab, 
      // but usually browsers handle this or we rely on page unload which is fine for SPA
      setTimeout(() => window.URL.revokeObjectURL(url), 60000); // Revoke after 1 min as cleanup
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}

export const api = new ApiService();