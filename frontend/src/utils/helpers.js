/**
 * Utility Functions
 */

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time to readable string
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format datetime
export const formatDateTime = (date) => {
  return `${formatDate(date)} às ${formatTime(date)}`;
};

// Get initials from name
export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();
};

// Calculate percentage
export const calculatePercentage = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Capitalize string
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Sort array of objects
export const sortBy = (array, key, order = "asc") => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === "asc" ? -1 : 1;
    if (a[key] > b[key]) return order === "asc" ? 1 : -1;
    return 0;
  });
};
