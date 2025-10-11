// API service functions for frontend
const API_BASE = '/api';

export interface Crane {
  id: string;
  queue: QueueItem[];
}

export interface QueueItem {
  crane_id: string;
  ord: number;
  piece: string;
  note?: string;
  status: 'pending' | 'working' | 'stopped' | 'success' | 'error';
  started_at?: number;
  ended_at?: number;
  booking_id?: string;
}

export interface WorkLog {
  id: string;
  crane_id: string;
  operator_id: string;
  operator_name: string;
  work_date: string;
  shift: 'morning' | 'afternoon' | 'night';
  actual_work: string;
  actual_time: number; // in minutes
  status: 'ปกติ' | 'ล่าช้า' | 'เร่งด่วน' | 'เสร็จก่อน';
  note?: string;
  created_at: number;
}

export interface HistoryItem {
  id: string;
  crane: string;
  piece: string;
  start_ts?: number;
  end_ts?: number;
  duration_min?: number;
  status: string;
}

export interface Booking {
  id: string;
  crane: string;
  item: string;
  requester: string;
  phone: string;
  purpose: string;
  start_ts: number;
  end_ts: number;
  note?: string;
  status: 'รอการอนุมัติ' | 'อนุมัติ' | 'ปฏิเสธ';
  created_at: number;
}

// Internal type for creating bookings (matches backend schema)
export interface BookingCreateData {
  crane: string;
  item: string;
  requester: string;
  phone: string;
  purpose: string;
  start: number;
  end: number;
  note?: string;
}

export interface WorkType {
  id: string;
  name: string;
  estimated_time: number; // in minutes
  description: string;
}

// API functions
export const api = {
  // Cranes
  async getCranes(token?: string): Promise<Crane[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/cranes`, { headers });
      if (!response.ok) throw new Error('Failed to fetch cranes');
      return response.json();
    } catch (error) {
      console.error('Error fetching cranes:', error);
      throw error;
    }
  },

  async createCrane(craneId: string, token?: string): Promise<{ message: string; craneId: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: craneId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create crane');
    }
    return response.json();
  },

  async deleteCrane(craneId: string, token?: string): Promise<{ message: string; craneId: string }> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes/${craneId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete crane');
    }
    return response.json();
  },

  async startTask(craneId: string, order: number, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes/${craneId}/start/${order}`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to start task');
  },

  async stopTask(craneId: string, order: number, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes/${craneId}/stop/${order}`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to stop task');
  },

  async rollbackTask(craneId: string, order: number, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes/${craneId}/rollback/${order}`, {
      method: 'POST',
      headers
    });
    if (!response.ok) throw new Error('Failed to rollback task');
  },

  async createQueueItem(craneId: string, data: { piece: string; note?: string; workType?: string }): Promise<{ message: string; craneId: string; ord: number }> {
    const response = await fetch(`${API_BASE}/cranes/${craneId}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create queue item');
    }
    return response.json();
  },

  async deleteQueueItem(craneId: string, ord: number, token?: string): Promise<{ message: string; craneId: string; ord: number }> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/cranes/${craneId}/queue/${ord}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete queue item');
    }
    return response.json();
  },

  // History
  async getHistory(token?: string, crane?: string, q?: string): Promise<HistoryItem[]> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const params = new URLSearchParams();
    if (crane && crane !== 'ALL') params.set('crane', crane);
    if (q) params.set('q', q);
    const url = `${API_BASE}/history${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  // Bookings
  async getBookings(token?: string): Promise<Booking[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/bookings`, { headers });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  async createBooking(booking: BookingCreateData, token?: string): Promise<Booking> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle validation errors from backend
        if (response.status === 400 && errorData.flatten) {
          const validationErrors = errorData.flatten.fieldErrors;
          const errorMessages = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : String(errors)}`)
            .join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }

        throw new Error(errorData.error || `Failed to create booking: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Network or parsing error:', error);
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: Booking['status'], token?: string, role?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (role) {
      headers['x-role'] = role;
    }

    const response = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update booking status: ${response.statusText}`);
    }
  },

  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: { id: string; username: string; role: string } }> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Network or parsing error:', error);
      throw error;
    }
  },

  async getProfile(token: string): Promise<{ id: string; username: string; role: string }> {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  // Work Logs
  async getWorkLogs(token?: string): Promise<WorkLog[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/work-logs`, { headers });
      if (!response.ok) throw new Error('Failed to fetch work logs');
      return response.json();
    } catch (error) {
      console.error('Error fetching work logs:', error);
      throw error;
    }
  },

  async createWorkLog(workLog: Omit<WorkLog, 'id' | 'created_at'>, token?: string): Promise<WorkLog> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/work-logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(workLog),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle validation errors from backend
        if (response.status === 400 && errorData.flatten) {
          const validationErrors = errorData.flatten.fieldErrors;
          const errorMessages = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : String(errors)}`)
            .join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }

        throw new Error(errorData.error || `Failed to create work log: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Network or parsing error:', error);
      throw error;
    }
  },

  // Work Logs delete
  async deleteWorkLog(id: string, token?: string): Promise<{ message: string }> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/work-logs/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete work log');
      }
      return response.json();
    } catch (error) {
      console.error('Error deleting work log:', error);
      throw error;
    }
  },

  // Work Types
  async getWorkTypes(token?: string): Promise<{ types: WorkType[] }> {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE}/work-types`, { headers });
      if (!response.ok) throw new Error('Failed to fetch work types');
      return response.json();
    } catch (error) {
      console.error('Error fetching work types:', error);
      throw error;
    }
  },
};
