import React, { useState, useEffect } from 'react';

const FeedbackForm = ({ sessionId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    categories: {
      clarity: 5,
      engagement: 5,
      helpfulness: 5,
    },
  });

  const [errors, setErrors] = useState({});

  const handleRatingChange = (category, value) => {
    if (category === 'overall') {
      setFormData(prev => ({
        ...prev,
        rating: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: value,
        },
      }));
    }
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.rating) newErrors.rating = 'Please provide an overall rating';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      sessionId,
      ...formData,
    });
  };

  const renderStarRating = (value, onChange) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl transition ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Share Your Feedback</h2>

      {/* Overall Rating */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Overall Rating *
        </label>
        {renderStarRating(formData.rating, (value) => handleRatingChange('overall', value))}
        <p className="text-sm text-gray-600 mt-2">
          {formData.rating === 5 ? 'Excellent!' : formData.rating === 4 ? 'Very Good' : formData.rating === 3 ? 'Good' : formData.rating === 2 ? 'Fair' : 'Poor'}
        </p>
        {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b">
        {['clarity', 'engagement', 'helpfulness'].map(category => (
          <div key={category}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 capitalize">
              {category}
            </label>
            {renderStarRating(
              formData.categories[category],
              (value) => handleRatingChange(category, value)
            )}
          </div>
        ))}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Feedback
        </label>
        <textarea
          value={formData.comment}
          onChange={handleCommentChange}
          placeholder="Share your thoughts about the session (optional)"
          rows="4"
          maxLength="300"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/300 characters</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting Feedback...' : 'Submit Feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm;
