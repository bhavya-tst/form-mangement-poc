import Joi from "joi";

export const migrateWebsitesSchema = Joi.object({
  targetFormId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Target form ID must be a number',
      'number.integer': 'Target form ID must be an integer',
      'number.positive': 'Target form ID must be positive',
      'any.required': 'Target form ID is required'
    }),
  
  // Individual selection mode
  websiteIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .messages({
      'array.base': 'Website IDs must be an array',
      'array.min': 'At least one website ID is required'
    }),
  
  // Select all mode
  selectAll: Joi.boolean()
    .valid(true)
    .messages({
      'boolean.base': 'selectAll must be a boolean',
      'any.only': 'selectAll must be true when provided'
    }),
  
  sourceFormId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'Source form ID must be a number',
      'number.integer': 'Source form ID must be an integer',
      'number.positive': 'Source form ID must be positive'
    }),
  
  search: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.base': 'Search must be a string'
    })
})
  // Use xor to ensure either websiteIds OR selectAll is provided, not both
  .xor('websiteIds', 'selectAll')
  // Custom validation for conditional requirements
  .custom((value, helpers) => {
    if (value.selectAll) {
      // When selectAll is true, sourceFormId is required
      if (!value.sourceFormId) {
        return helpers.error('any.required', { label: 'sourceFormId' });
      }
      // websiteIds should not be present
      if (value.websiteIds) {
        return helpers.error('object.xor', { peers: ['websiteIds', 'selectAll'] });
      }
    } else if (value.websiteIds) {
      // When using websiteIds, sourceFormId and search should not be present
      if (value.sourceFormId) {
        return helpers.error('object.unknown', { label: 'sourceFormId' });
      }
      if (value.search) {
        return helpers.error('object.unknown', { label: 'search' });
      }
    }
    return value;
  })
  .messages({
    'object.xor': 'Either websiteIds or selectAll must be provided, but not both',
    'any.required': 'Source form ID is required when selectAll is true',
    'object.unknown': 'Field is not allowed when using individual website IDs'
  })
  .options({ 
    abortEarly: false, 
    stripUnknown: true,
    convert: true 
  });
