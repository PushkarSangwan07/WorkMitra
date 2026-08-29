const ApiError = require('../utils/ApiError');

// Usage: validate(schema) as route middleware. Validates req.body by default.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
