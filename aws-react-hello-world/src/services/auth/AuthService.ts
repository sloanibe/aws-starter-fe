import { apiConfig } from '../../config/apiConfig';

export interface GuestUser {
  email: string;
  name: string;
  username: string;
}

class AuthService {
  async loginAsGuest(email: string, name: string): Promise<GuestUser> {
    try {
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.users}/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          username: 'guest'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const user = await response.json();
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Error during guest login:', error);
      throw error;
    }
  }

  setUser(user: GuestUser): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): GuestUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
}

export const authService = new AuthService();
