// Notification Service for simulating notifications
class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(notification) {
    this.notifications.push({
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
    });
    this.listeners.forEach(listener => listener(notification));
  }

  success(title, message) {
    this.notify({
      type: 'success',
      title,
      message,
    });
  }

  error(title, message) {
    this.notify({
      type: 'error',
      title,
      message,
    });
  }

  info(title, message) {
    this.notify({
      type: 'info',
      title,
      message,
    });
  }

  warning(title, message) {
    this.notify({
      type: 'warning',
      title,
      message,
    });
  }

  getLatest(limit = 5) {
    return this.notifications.slice(-limit);
  }

  clear() {
    this.notifications = [];
  }
}

export default new NotificationService();
