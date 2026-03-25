// Date and time utilities
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isUpcoming = (dateString) => {
  return new Date(dateString) > new Date();
};

export const isPast = (dateString) => {
  return new Date(dateString) < new Date();
};

export const getCountdownText = (dateString) => {
  const now = new Date();
  const eventDate = new Date(dateString);
  const diffMs = eventDate - now;

  if (diffMs < 0) return 'Session ended';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Starting soon';
  if (diffMins < 60) return `${diffMins}m remaining`;
  if (diffHours < 24) return `${diffHours}h remaining`;
  return `${diffDays}d remaining`;
};

// Validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, obj) => {
    const group = obj[key];
    if (!result[group]) result[group] = [];
    result[group].push(obj);
    return result;
  }, {});
};

export const calculateAverage = (numbers) => {
  return numbers.length > 0
    ? (numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)
    : 0;
};
