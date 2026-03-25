import React from 'react';

const SessionCard = ({ session, onJoin, onViewDetails }) => {
  const availableSlots = session.capacity - session.enrolledCount;
  const isFull = availableSlots === 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{session.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {session.tutorName}</p>
        </div>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {session.subject}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{session.description}</p>

      {/* Date, Time, Duration */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
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
          <span className="text-gray-700">{session.enrolledCount}/{session.capacity}</span>
        </div>
      </div>

      {/* Rating */}
      {session.averageRating > 0 && (
        <div className="mb-4">
          {renderRating(session.averageRating)}
        </div>
      )}

      {/* Tags */}
      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {session.tags.map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Availability Status */}
      <div className="mb-4">
        {isFull ? (
          <p className="text-sm text-red-600 font-semibold">Session Full</p>
        ) : (
          <p className="text-sm text-green-600 font-semibold">{availableSlots} slots available</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(session._id)}
          className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition font-medium"
        >
          View Details
        </button>
        <button
          onClick={() => onJoin(session._id)}
          disabled={isFull}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            isFull
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Join Session
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
