'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    // Sample Usta users
    const users = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        first_name: 'Ahmed',
        last_name: 'Khan',
        email: 'ahmed.plumber@test.com',
        phone: '1234567890',
        email_verified: true,
        phone_verified: true,
        password: hashedPassword,
        auth_provider: 'email',
        role: 'usta',
        status: 'active',
        profile_picture: 'https://myusta-images-videos.s3.amazonaws.com/profiles/ahmed-khan.jpg',
        average_rating: 4.8,
        total_ratings: 156,
        total_hires: 89,
        total_views: 2340,
        is_verified: true,
        is_featured: true,
        search_boost: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.electrician@test.com',
        phone: '1234567891',
        email_verified: true,
        phone_verified: true,
        password: hashedPassword,
        auth_provider: 'email',
        role: 'usta',
        status: 'active',
        profile_picture: 'https://myusta-images-videos.s3.amazonaws.com/profiles/sarah-johnson.jpg',
        average_rating: 4.9,
        total_ratings: 203,
        total_hires: 127,
        total_views: 3120,
        is_verified: true,
        is_featured: true,
        search_boost: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Add more sample users as needed...
    ];

    await queryInterface.bulkInsert('users', users);

    // Sample professional details
    const professionalDetails = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        user_id: '660e8400-e29b-41d4-a716-446655440001',
        nipt: 'J12345678A',
        experiences: JSON.stringify([
          { category: 'plumber', yearsOfExp: 8 },
          { category: 'pipe_fitter', yearsOfExp: 8 },
          { category: 'drain_specialist', yearsOfExp: 5 }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        user_id: '660e8400-e29b-41d4-a716-446655440002',
        nipt: 'J87654321B',
        experiences: JSON.stringify([
          { category: 'electrician', yearsOfExp: 12 },
          { category: 'lighting_specialist', yearsOfExp: 10 },
          { category: 'wiring_technician', yearsOfExp: 12 }
        ]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('professional_details', professionalDetails);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('professional_details', null, {});
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['ahmed.plumber@test.com', 'sarah.electrician@test.com']
      }
    }, {});
  }
};