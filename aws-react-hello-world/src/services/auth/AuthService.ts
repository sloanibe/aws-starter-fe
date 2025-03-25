import { apiConfig } from '../../config/apiConfig';

export interface GuestUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  organization: string;
  avatar: string | null;
  role: string | null;
  createdAt: string;
  lastLogin: string;
  projects: any[] | null;
  projectMemberships: any[] | null;
  createdTasks: any[] | null;
  assignedTasks: any[] | null;
}

class AuthService {
  async loginAsGuest(email: string, name: string, company?: string): Promise<GuestUser> {
    try {
      // Use the new login service endpoint
      const response = await fetch(`${apiConfig.apiBaseUrl}${apiConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          organization: company || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const loginResponse = await response.json();
      
      // Map the login response to our GuestUser interface
      const user: GuestUser = {
        id: loginResponse.userId,
        username: loginResponse.name.toLowerCase().replace(/\s+/g, '.'),
        displayName: loginResponse.name,
        email: loginResponse.email,
        organization: loginResponse.organization,
        avatar: null,
        role: 'guest',
        createdAt: loginResponse.createdAt || new Date().toISOString(),
        lastLogin: loginResponse.lastLogin || new Date().toISOString(),
        projects: null,
        projectMemberships: null,
        createdTasks: null,
        assignedTasks: null
      };
      
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
