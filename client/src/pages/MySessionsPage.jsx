import React, { useState, useEffect } from 'react';

const MySessionsPage = () => {
  const [createdSessions, setCreatedSessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [createdResponse, joinedResponse] = await Promise.all([
        fetch('/api/sessions/tutor/my-sessions'),
        fetch('/api/registrations/student/my-registrations'),
      ]);

      const createdData = await createdResponse.json();
      const joinedData = await joinedResponse.json();

      if (createdData.success) setCreatedSessions(createdData.data);
      if (joinedData.success) setJoinedSessions(joinedData.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SessionCard = ({ session, isCreated }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{session.title || session.session?.title}</h3>
          <p className="text-gray-600 text-sm">
            {isCreated ? session.subject : session.session?.subject}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(session.status)}`}>
          {session.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">📅 Date & Time</p>
          <p className="text-gray-900 font-semibold">
            {formatDate(session.date || session.session?.date)}
          </p>
        </div>
        <div>
          <p className="text-gray-600">⏱️ Duration</p>
          <p className="text-gray-900 font-semibold">
            {(session.duration || session.session?.duration)} minutes
          </p>
        </div>
      </div>

      {isCreated ? (
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600">👥 Enrolled</p>
            <p className="text-gray-900 font-semibold">
              {session.enrolledCount}/{session.capacity}
            </p>
          </div>
          <div>
            <p className="text-gray-600">👁️ Views</p>
            <p className="text-gray-900 font-semibold">{session.viewCount}</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-gray-600 text-sm">
            📍 Tutor: {session.session?.tutor?.firstName} {session.session?.tutor?.lastName}
          </p>
        </div>
      )}

      {isCreated && session.status === 'Rejected' && (
        <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
          <p className="text-red-800 text-sm font-semibold">Rejection Reason:</p>
          <p className="text-red-700 text-sm">{session.rejectionReason}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-medium">
          View Details
        </button>
        {!isCreated && session.status === 'Active' && (
          <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium">
            Leave
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Sessions</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'created'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sessions I Created ({createdSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'joined'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sessions I Joined ({joinedSessions.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : activeTab === 'created' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdSessions.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">You haven't created any sessions yet.</p>
              </div>
            ) : (
              createdSessions.map(session => (
                <SessionCard key={session._id} session={session} isCreated={true} />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedSessions.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">You haven't joined any sessions yet.</p>
              </div>
            ) : (
              joinedSessions.map(registration => (
                <SessionCard
                  key={registration._id}
                  session={registration}
                  isCreated={false}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySessionsPage;
