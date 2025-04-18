// constants.js

const ROLES = {
  CUSTOMER: 'customer',
  USTA: 'usta',
};

const STATUS = {
  ACTIVE: 'active',
  INPROGRESS: 'inprogress',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

const AUTH_PROVIDERS = {
  EMAIL: 'email',
  PHONE: 'phone',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
};

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
};

const JOB_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const PROPOSAL_TYPES = {
  PROJECT: 'project',
  MILESTONE: 'milestone',
};

const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

const MILESTONE_STATUS = {
  PENDING: 'pending',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

// categories.js
const CATEGORY = [
  { key: 'plumber', name: 'Plumber' },
  { key: 'electrician', name: 'Electrician' },
  { key: 'carpenter', name: 'Carpenter' },
  { key: 'cleaner', name: 'Cleaner' },
  { key: 'painter', name: 'Painter' }
]

// Allowed category keys (e.g., ['plumber', 'electrician', ...])
const ALLOWED_CATEGORY_KEYS = CATEGORY.map(category => category.key);


// jobTypes.js
const PREFERRED_JOB_TYPES = [
  { key: 'short_term', name: 'Short Term' },
  { key: 'long_term', name: 'Long Term' },
  { key: 'emergency', name: 'Emergency' },
]

// Allowed keys extract karne ke liye pehle PREFERRED_JOB_TYPES declare hona chahiye
const ALLOWED_JOB_TYPES = PREFERRED_JOB_TYPES.map(jobType => jobType.key);

// Export dono cheezein
module.exports = {
  PREFERRED_JOB_TYPES,
  ALLOWED_JOB_TYPES,
  CATEGORY,
  ALLOWED_CATEGORY_KEYS,
  ROLES,
  STATUS,
  AUTH_PROVIDERS,
  PAYMENT_METHODS,
  JOB_STATUS,
  PROPOSAL_TYPES,
  PROPOSAL_STATUS,
  MILESTONE_STATUS,
};
