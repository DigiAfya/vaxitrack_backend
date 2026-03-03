const ApiError = require("../utilities/ApiErr.util");

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (
    password.length < minLength ||
    !hasUpperCase ||
    !hasDigit ||
    !hasSpecialChar
  ) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and include at least one uppercase letter, one digit, and one special character."
    );
  }
};

module.exports = { validatePassword };
