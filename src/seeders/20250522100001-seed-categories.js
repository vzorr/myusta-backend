'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Plumber',
        key: 'plumber',
        description: 'Professional plumbing services including pipe repairs, installations, leak fixes, and bathroom renovations',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/plumber.svg',
        parent_id: null,
        level: 0,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Electrician',
        key: 'electrician',
        description: 'Electrical services including wiring, installations, repairs, and electrical system maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/electrician.svg',
        parent_id: null,
        level: 0,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Carpenter',
        key: 'carpenter',
        description: 'Carpentry services including furniture making, repairs, custom woodwork, and installations',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/carpenter.svg',
        parent_id: null,
        level: 0,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Cleaning',
        key: 'cleaner',
        description: 'Professional cleaning services for homes, offices, and commercial spaces',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/cleaner.svg',
        parent_id: null,
        level: 0,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Renovation',
        key: 'renovation',
        description: 'Complete renovation services including kitchen, bathroom, and home remodeling',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/renovation.svg',
        parent_id: null,
        level: 0,
        display_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Other',
        key: 'other',
        description: 'Various additional services and specialized trades',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/other.svg',
        parent_id: null,
        level: 0,
        display_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', categories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};