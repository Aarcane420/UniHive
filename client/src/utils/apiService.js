// API Service for centralized API calls
const API_BASE_URL = '/api';

class APIService {
  // Session APIs
  static async createSession(sessionData) {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    return response.json();
  }

  static async getSessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/sessions?${params.toString()}`);
    return response.json();
  }

  static async getSessionById(id) {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
    return response.json();
  }

  static async getTutorSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions/tutor/my-sessions`);
    return response.json();
  }

  static async getPopularSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions/leaderboard/popular`);
    return response.json();
  }

  // Registration APIs
  static async joinSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/registrations/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return response.json();
  }

  static async getMyRegistrations() {
    const response = await fetch(`${API_BASE_URL}/registrations/student/my-registrations`);
    return response.json();
  }

  static async getSessionEnrollments(sessionId) {
    const response = await fetch(`${API_BASE_URL}/registrations/session/${sessionId}`);
    return response.json();
  }

  static async leaveSession(registrationId) {
    const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Feedback APIs
  static async submitFeedback(feedbackData) {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    return response.json();
  }

  static async getSessionFeedback(sessionId, page = 1, limit = 5) {
    const response = await fetch(
      `${API_BASE_URL}/feedback/session/${sessionId}?page=${page}&limit=${limit}`
    );
    return response.json();
  }

  static async getTutorStats(tutorId) {
    const response = await fetch(`${API_BASE_URL}/feedback/tutor/${tutorId}`);
    return response.json();
  }

  static async getTopTutors(limit = 10) {
    const response = await fetch(`${API_BASE_URL}/feedback/leaderboard/top-tutors?limit=${limit}`);
    return response.json();
  }

  // Admin APIs
  static async getPendingSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions/admin/pending`);
    return response.json();
  }

  static async approveSession(sessionId, comments = '') {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverComments: comments }),
    });
    return response.json();
  }

  static async rejectSession(sessionId, reason) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionReason: reason }),
    });
    return response.json();
  }
}

export default APIService;
