
const API_BASE_URL = 'https://dskalmunai.lk/backend/api';

interface LoginData {
  username: string;
  password: string;
  role: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data?: {
    user: any;
    token: string;
    expires_at: number;
  };
}

export class AuthService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Invalid response type: ${contentType}`);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<any> {
    const response = await this.makeRequest<LoginResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response && typeof response === 'object' && 'status' in response) {
      if (response.status === 'success' && response.data) {
        return response.data;
      }
    }
    
    throw new Error('Invalid login response format');
  }
}

export const authService = new AuthService();
