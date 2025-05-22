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
  // MAIN CATEGORIES
  { key: 'plumber', name: 'Plumber' },
  { key: 'electrician', name: 'Electrician' },
  { key: 'carpenter', name: 'Carpenter' },
  { key: 'cleaner', name: 'Cleaning' },
  { key: 'renovation', name: 'Renovation' },
  { key: 'other', name: 'Other' },
  
  // PLUMBER SUBCATEGORIES
  { key: 'pipe_fitter', name: 'Pipe Fitter' },
  { key: 'drain_specialist', name: 'Drain Specialist' },
  { key: 'bathroom_kitchen_installer', name: 'Bathroom Kitchen Installer' },
  { key: 'irrigation_technician', name: 'Irrigation Technician' },
  
  // ELECTRICIAN SUBCATEGORIES
  { key: 'lighting_specialist', name: 'Lighting Specialist' },
  { key: 'wiring_technician', name: 'Wiring Technician' },
  { key: 'solar_installer', name: 'Solar Installer' },
  { key: 'security_system_installer', name: 'Security System Installer' },
  
  // CARPENTER SUBCATEGORIES
  { key: 'furniture_builder', name: 'Furniture Builder' },
  { key: 'cabinet_installer', name: 'Cabinet Installer' },
  { key: 'flooring_specialist', name: 'Flooring Specialist' },
  { key: 'deck_builder', name: 'Deck Builder' },
  
  // CLEANING SUBCATEGORIES
  { key: 'house_cleaner', name: 'House Cleaner' },
  { key: 'carpet_cleaner', name: 'Carpet Cleaner' },
  { key: 'window_cleaner', name: 'Window Cleaner' },
  { key: 'deep_cleaning_specialist', name: 'Deep Cleaning Specialist' },
  { key: 'gutter_cleaner', name: 'Gutter Cleaner' },
  
  // RENOVATION SUBCATEGORIES
  { key: 'general_contractor', name: 'General Contractor' },
  { key: 'painter', name: 'Painter' },
  { key: 'tiler', name: 'Tiler' },
  { key: 'roofer', name: 'Roofer' },
  
  // OTHER SUBCATEGORIES
  { key: 'locksmith', name: 'Locksmith' },
  { key: 'gardener_landscaper', name: 'Gardener/ Landscaper' },
  { key: 'pest_control_specialist', name: 'Pest Control Specialist' },
  { key: 'hvac_technician', name: 'HVAC Technician' },
  { key: 'curtain_blind_installer', name: 'Curtain/ Blind Installer' }
];

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

const PERCENTAGE = {
  jobProposal : 10
}

// JobProposal.js
const WHO_WILL_PROVIDE_MATERIAL = {
  CUSTOMER: 'customer',
  USTA: 'usta',
  PARTIAL: 'partial',
};

// contract.js
const CONTRACT_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};


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
  PERCENTAGE,
  WHO_WILL_PROVIDE_MATERIAL,
  CONTRACT_STATUS
};
