import React, { useState, useEffect } from 'react';
import FeedbackForm from './FeedbackForm';

const SessionDetails = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [tutorStats, setTutorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const [sessionResponse, feedbackResponse] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/feedback/session/${sessionId}`),
      ]);

      const sessionData = await sessionResponse.json();
      const feedbackData = await feedbackResponse.json();

      if (sessionData.success) {
        setSession(sessionData.data);
        
        // Fetch tutor stats
        const tutorResponse = await fetch(`/api/feedback/tutor/${sessionData.data.tutor._id}`);
        const tutorData = await tutorResponse.json();
        setTutorStats(tutorData.data);
      }

      if (feedbackData.success) {
        setFeedback(feedbackData.data);
      }
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      const response = await fetch('/api/registrations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (data.success) {
        setJoined(true);
        fetchSessionDetails();
        alert('Successfully joined the session!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="ml-2 text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!session) return <div className="text-center py-12">Session not found</div>;

  const availableSlots = session.capacity - session.enrolledCount;
  const isFull = availableSlots === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Sessions
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="inline-block bg-blue-900 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {session.subject}
                </span>
                <h1 className="text-4xl font-bold mb-4">{session.title}</h1>
                <p className="text-blue-100 mb-4">Taught by {session.tutorName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold mb-2">${session.duration}</p>
                <p className="text-blue-100">Duration: {session.duration} min</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-12">
            {/* Session Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Session Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-gray-600 text-sm">Date & Time</p>
                      <p className="text-gray-900 font-semibold">{formatDate(session.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="text-gray-600 text-sm">Availability</p>
                      <p className="text-gray-900 font-semibold">
                        {session.enrolledCount}/{session.capacity} students
                        ({availableSlots} slots available)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">🔗</span>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm">Meeting Link</p>
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-semibold truncate"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutor Info & Stats */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Tutor Profile</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-900 font-semibold text-lg mb-2">{session.tutorName}</p>
                  {tutorStats && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Rating</p>
                        {renderStars(tutorStats.averageRating)}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">
                          {tutorStats.totalReviews} reviews from students
                        </p>
                      </div>
                      {tutorStats.breakdown && (
                        <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">RATINGS BREAKDOWN</p>
                          <div className="space-y-1 text-xs">
                            <p>Clarity: {tutorStats.breakdown.clarity}/5</p>
                            <p>Engagement: {tutorStats.breakdown.engagement}/5</p>
                            <p>Helpfulness: {tutorStats.breakdown.helpfulness}/5</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About This Session</h3>
              <p className="text-gray-700 leading-relaxed">{session.description}</p>
            </div>

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Join Button */}
            {!joined && (
              <div className="mb-12 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <button
                  onClick={handleJoinSession}
                  disabled={isFull}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFull ? 'Session Full' : 'Join This Session'}
                </button>
              </div>
            )}

            {/* Feedback Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Student Feedback</h3>
              
              {joined && !showFeedbackForm && (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Leave Feedback
                </button>
              )}

              {showFeedbackForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <FeedbackForm
                    sessionId={sessionId}
                    onSubmit={async (data) => {
                      try {
                        const response = await fetch('/api/feedback', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data),
                        });
                        const result = await response.json();
                        if (result.success) {
                          alert('Thank you for your feedback!');
                          setShowFeedbackForm(false);
                          fetchSessionDetails();
                        }
                      } catch (error) {
                        console.error('Failed to submit feedback:', error);
                      }
                    }}
                    loading={false}
                  />
                </div>
              )}

              {feedback.length === 0 ? (
                <p className="text-gray-600">No feedback yet. Be the first to leave a review!</p>
              ) : (
                <div className="space-y-4">
                  {feedback.map(fb => (
                    <div key={fb._id} className="bg-gray-50 rounded-lg p-6 border-l-4 border-yellow-400">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900">{fb.student.firstName} {fb.student.lastName}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < fb.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{fb.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
