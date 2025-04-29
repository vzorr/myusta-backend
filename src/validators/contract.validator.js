const Joi = require('joi');

exports.createContractSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  totalCost: Joi.number().required(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').optional(), // usually default to 'pending'
  details: Joi.string().allow('', null),
  jobId: Joi.string().guid().required(),
  ustaId: Joi.string().guid().required(),
  jobProposalId: Joi.string().guid().required()
});

exports.updateContractStatusSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required()
});