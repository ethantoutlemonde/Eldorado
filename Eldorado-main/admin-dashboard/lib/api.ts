const API_BASE_URL = "http://127.0.0.1:8000/api"

export interface User {
  id: string // Ethereum wallet address
  prenom: string
  nom: string
  date_naissance: string
  statut: "verified" | "banned" | "pending" | "admin"
}

export class ApiService {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  }

  // Get all users
  static async getUsers(): Promise<User[]> {
    return this.request("/users")
  }

  // Get user by wallet address
  static async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`)
  }

  // Update user
  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Create user
  static async createUser(userData: Omit<User, "id">): Promise<User> {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }
}
