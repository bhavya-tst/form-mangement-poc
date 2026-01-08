import Joi from "joi";

export const createFormSchema = Joi.object({
  sourceType: Joi.string()
    .valid('cdn', 'file')
    .required()
    .messages({
      'any.required': 'Source type is required',
      'any.only': 'Source type must be either "cdn" or "file"'
    }),
  
  cdnUrl: Joi.string()
    .uri()
    .when('sourceType', {
      is: 'cdn',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'string.uri': 'CDN URL must be a valid URL',
      'any.required': 'CDN URL is required when source type is "cdn"'
    }),
  
  fileContent: Joi.string()
    .max(10485760) // 10MB max for safety
    .when('sourceType', {
      is: 'file',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'string.max': 'File content is too large (max 10MB)',
      'any.required': 'File content is required when source type is "file"'
    })
}).options({ 
  abortEarly: false, 
  stripUnknown: true,
  convert: true 
});
