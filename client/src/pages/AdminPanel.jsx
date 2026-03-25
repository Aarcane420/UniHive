import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [pendingSessions, setPendingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [formData, setFormData] = useState({
    comment: '',
    reason: '',
  });

  useEffect(() => {
    fetchPendingSessions();
  }, []);

  const fetchPendingSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions/admin/pending');
      const data = await response.json();
      if (data.success) {
        setPendingSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverComments: formData.comment }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Session approved successfully!');
        setPendingSessions(pendingSessions.filter(s => s._id !== sessionId));
        setSelectedSession(null);
        setFormData({ comment: '', reason: '' });
      }
    } catch (error) {
      console.error('Failed to approve session:', error);
      alert('Failed to approve session');
    }
  };

  const handleReject = async (sessionId) => {
    if (!formData.reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: formData.reason }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Session rejected successfully!');
        setPendingSessions(pendingSessions.filter(s => s._id !== sessionId));
        setSelectedSession(null);
        setFormData({ comment: '', reason: '' });
      }
    } catch (error) {
      console.error('Failed to reject session:', error);
      alert('Failed to reject session');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600 mb-8">Review and approve tutoring sessions</p>

        {pendingSessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">✓ No pending sessions. All clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sessions List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {pendingSessions.map(session => (
                  <div
                    key={session._id}
                    onClick={() => setSelectedSession(session)}
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 cursor-pointer transition ${
                      selectedSession?._id === session._id
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-yellow-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                        <p className="text-gray-600 text-sm">
                          by {session.tutorName} • {session.subject}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Pending
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{session.description}</p>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span className="text-gray-700">{formatDate(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">⏱️</span>
                        <span className="text-gray-700">{session.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👥</span>
                        <span className="text-gray-700">Up to {session.capacity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details & Actions */}
            {selectedSession && (
              <div className="bg-white rounded-lg shadow-md p-8 h-fit sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Session</h2>

                {/* Session Info */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-gray-600 text-sm mb-2">Session:</p>
                  <p className="text-lg font-semibold text-gray-900 mb-4">{selectedSession.title}</p>

                  <p className="text-gray-600 text-sm mb-2">Tutor Email:</p>
                  <p className="text-gray-900 font-semibold mb-4">{selectedSession.tutor.email}</p>

                  <p className="text-gray-600 text-sm mb-2">Meeting Link:</p>
                  <a
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-all font-medium"
                  >
                    {selectedSession.meetingLink}
                  </a>
                </div>

                {/* Full Description */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-gray-600 text-sm mb-2">Description:</p>
                  <p className="text-gray-900">{selectedSession.description}</p>
                </div>

                {/* Approval Form */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Approval Comments (Optional)
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Add any feedback for the tutor..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Rejection Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason (if applicable)
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="Explain why this session doesn't meet requirements..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleApprove(selectedSession._id)}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    ✓ Approve Session
                  </button>
                  <button
                    onClick={() => handleReject(selectedSession._id)}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    ✗ Reject Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
