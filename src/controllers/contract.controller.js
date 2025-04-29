const contractService = require('../services/contract.service');
const { successResponse, errorResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

exports.createContract = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const contractData = req.body;
    const result = await contractService.createContract(customerId, contractData);

    if (!result.success) {
      return errorResponse(res, result.message, result.errors, 400);
    }
    logger.info(`Contract created by customer ${customerId}`);
    return successResponse(res, result.message, result.data);
  } catch (error) {
    logger.error(`Unexpected error in createContract: ${error.message}`);
    return next({ statusCode: 500, message: 'Internal server error' });
  }
};

exports.getContractDetails = async (req, res, next) => {
    try {
      const contractId = req.params.id;
      const user = req.user;
      const result = await contractService.getContractDetails(contractId, user);
  
      if (!result.success) {
        return errorResponse(res, result.message, result.errors, result.statusCode || 404);
      }
  
      return successResponse(res, result.message, result.data);
    } catch (error) {
      logger.error(`Unexpected error in getContractDetails: ${error.message}`);
      return next({ statusCode: 500, message: 'Internal server error' });
    }
  };

  exports.updateContractStatus = async (req, res, next) => {
    try {
      const contractId = req.params.id;
      const ustaId = req.user.id;
      const { status } = req.body;
      const result = await contractService.updateContractStatus(contractId, ustaId, status);
  
      if (!result.success) {
        return errorResponse(res, result.message, result.errors, result.statusCode || 400);
      }
      return successResponse(res, result.message, result.data);
    } catch (error) {
      logger.error(`Unexpected error in updateContractStatus: ${error.message}`);
      return next({ statusCode: 500, message: 'Internal server error' });
    }
  };