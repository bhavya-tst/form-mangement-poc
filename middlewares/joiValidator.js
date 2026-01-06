
import createError from "http-errors";

export const joiValidator = (schema) => (req, res, next) => {
  const options = {
    errors: {
      wrap: {
        label: "",
      },
    },
  };
  const result = schema.validate(req.body, options);
  if (result.error)
    return next(createError(422, result.error.details[0].message));
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