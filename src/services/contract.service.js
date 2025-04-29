const { Contract, Job, User, JobProposal } = require('../models');
const { CONTRACT_STATUS, JOB_STATUS } = require('../utils/constant');

exports.createContract = async (customerId, contractData) => {
  try {
    const contract = await Contract.create({
      ...contractData,
      createdBy: customerId
    });

    return {
      success: true,
      message: 'Contract created successfully',
      data: contract
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create contract',
      errors: [error.message]
    };
  }
};

exports.getContractDetails = async (contractId, user) => {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [
          { model: User, as: 'usta', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
          { model: Job, as: 'job' },
          { model: JobProposal, as: 'JobProposal' }
        ]
      });
  
      if (!contract) {
        return { success: false, message: 'Contract not found', statusCode: 404 };
      }
  
      // Authorization: Only the customer or the usta involved can view
      if (
        contract.ustaId !== user.id &&
        contract.createdBy !== user.id
      ) {
        return { success: false, message: 'Unauthorized', statusCode: 403 };
      }
  
      return {
        success: true,
        message: 'Contract details fetched successfully',
        data: contract
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch contract details',
        errors: [error.message]
      };
    }
  };

  exports.updateContractStatus = async (contractId, ustaId, status) => {
    try {
      // Only allow accepted or rejected
      if (![CONTRACT_STATUS.ACCEPTED, CONTRACT_STATUS.REJECTED].includes(status)) {
        return { success: false, message: 'Invalid status', statusCode: 400 };
      }
  
      // Find contract and check usta
      const contract = await Contract.findByPk(contractId);
      if (!contract) {
        return { success: false, message: 'Contract not found', statusCode: 404 };
      }
      if (contract.ustaId !== ustaId) {
        return { success: false, message: 'Unauthorized', statusCode: 403 };
      }
  
      // Update contract status
      contract.status = status;
      await contract.save();
  
      // If accepted, set job status to active
      if (status === CONTRACT_STATUS.ACCEPTED) {
        const job = await Job.findByPk(contract.jobId);
        if (job) {
          job.status = JOB_STATUS.ACTIVE;
          await job.save();
        }
      }
  
      return {
        success: true,
        message: `Contract status updated to ${status}`,
        data: contract
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update contract status',
        errors: [error.message]
      };
    }
};