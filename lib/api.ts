const API_BASE = '/api'

async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
    }

    return data
}

// Helper to ensure credentials are always included
function fetchWithCredentials(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
        ...options,
        credentials: 'include',
    })
}

export const api = {
    auth: {
        register: async (email: string, password: string, name: string, companyName?: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, companyName }),
            })
            return handleResponse(response)
        },

        login: async (email: string, password: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            return handleResponse(response)
        },

        logout: async () => {
            const response = await fetchWithCredentials(`${API_BASE}/auth/logout`, {
                method: 'POST',
            })
            return handleResponse(response)
        },

        me: async () => {
            const response = await fetchWithCredentials(`${API_BASE}/auth/me`)
            return handleResponse(response)
        },
    },

    companies: {
        create: async (name: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/companies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            return handleResponse(response)
        },
        switch: async (companyId: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/companies/switch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId }),
            })
            return handleResponse(response)
        },
    },

    teams: {
        invite: async (email: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            return handleResponse(response)
        },
        listInvites: async () => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/invites`)
            return handleResponse(response)
        },
        acceptInvite: async (invitationId: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId }),
            })
            return handleResponse(response)
        },
        rejectInvite: async (invitationId: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId }),
            })
            return handleResponse(response)
        },
        listMembers: async () => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/members`)
            return handleResponse(response)
        },
        updateMember: async (userId: string, role: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/members`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role }),
            })
            return handleResponse(response)
        },
        removeMember: async (userId: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/teams/members?userId=${userId}`, {
                method: 'DELETE',
            })
            return handleResponse(response)
        },
    },

    tasks: {
        list: async (params?: {
            page?: number
            limit?: number
            status?: string
            priority?: string
            search?: string
            assignedToMe?: boolean
            publicOnly?: boolean
            personalOnly?: boolean
        }) => {
            const queryParams = new URLSearchParams()
            if (params?.page) queryParams.set('page', params.page.toString())
            if (params?.limit) queryParams.set('limit', params.limit.toString())
            if (params?.status) queryParams.set('status', params.status)
            if (params?.priority) queryParams.set('priority', params.priority)
            if (params?.search) queryParams.set('search', params.search)
            if (params?.assignedToMe) queryParams.set('assignedToMe', 'true')
            if (params?.publicOnly) queryParams.set('publicOnly', 'true')
            if (params?.personalOnly) queryParams.set('personalOnly', 'true')

            const response = await fetchWithCredentials(`${API_BASE}/tasks?${queryParams}`)
            return handleResponse(response)
        },

        get: async (id: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/tasks/${id}`)
            return handleResponse(response)
        },

        create: async (data: {
            title: string
            description?: string
            dueDate?: string
            priority?: string
            isPublic?: boolean
            assignedUserIds?: string[]
        }) => {
            const response = await fetchWithCredentials(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            return handleResponse(response)
        },

        update: async (id: string, data: {
            title?: string
            description?: string
            dueDate?: string
            status?: string
            priority?: string
            isPublic?: boolean
            assignedUserIds?: string[]
        }) => {
            const response = await fetchWithCredentials(`${API_BASE}/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            return handleResponse(response)
        },

        delete: async (id: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE',
            })
            return handleResponse(response)
        },
    },

    users: {
        list: async () => {
            const response = await fetchWithCredentials(`${API_BASE}/users`)
            return handleResponse(response)
        },

        create: async (data: {
            email: string
            password: string
            name: string
            role?: string
        }) => {
            const response = await fetchWithCredentials(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            return handleResponse(response)
        },

        delete: async (id: string) => {
            const response = await fetchWithCredentials(`${API_BASE}/users?id=${id}`, {
                method: 'DELETE',
            })
            return handleResponse(response)
        },
    },
}
