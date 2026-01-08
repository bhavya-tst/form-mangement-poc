
import createError from "http-errors";

export const joiValidator = (schema) => (req, res, next) => {
  // Merge schema options with default options
  const defaultOptions = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  
  const result = schema.validate(req.body, defaultOptions);
  if (result.error) {
    return next(createError(422, result.error.details[0].message));
  }
  
  // Replace req.body with sanitized/validated data
  req.body = result.value;
  next();
};

export const joiQueryValidator = (schema) => (req, res, next) => {
  const options = {
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const result = schema.validate(req.query, options);
  if (result.error) {
    return next(createError(422, result.error.details[0].message));
  }
  next();
};
    
export const joiParamsValidator = (schema) => (req, res, next) => {
  const options = {
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const result = schema.validate(req.params, options);
  if (result.error) {
    return next(createError(422, result.error.details[0].message));
  }
  next();
};