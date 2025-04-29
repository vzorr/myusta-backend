// src/utils/pagination.js

function getPaginationParams(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(query.limit, 10) || 10, 1);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }
  
  function formatPaginatedResponse({ rows, count }, page, limit) {
    const totalPages = Math.ceil(count / limit);
    return {
      data: rows,
      totalCount: count,
      totalPages,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
  
  module.exports = { getPaginationParams, formatPaginatedResponse };