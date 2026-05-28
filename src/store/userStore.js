import { create } from 'zustand'
import { userService } from '@/services/userService'

export const useUserStore = create((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  setUsers: (users) => set({ users }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  clearUsers: () => set({ users: [], selectedUser: null, error: null }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const users = await userService.getUsers()
      set({ users, isLoading: false })
      return users
    } catch (error) {
      set({ error, isLoading: false })
      throw error
    }
  },

  fetchUserById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const user = await userService.getUserById(id)
      set({ selectedUser: user, isLoading: false })
      return user
    } catch (error) {
      set({ error, isLoading: false })
      throw error
    }
  },
}))
