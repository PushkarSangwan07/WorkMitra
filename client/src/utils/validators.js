export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

export const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
