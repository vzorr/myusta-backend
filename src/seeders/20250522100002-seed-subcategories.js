'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const subcategories = [
      // PLUMBER SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655441001',
        name: 'Pipe Fitter',
        key: 'pipe_fitter',
        description: 'Specialized in pipe installation, repair, and maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/pipe-fitter.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440001',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441002',
        name: 'Drain Specialist',
        key: 'drain_specialist',
        description: 'Expert in drain cleaning, unclogging, and drainage system repair',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/drain-specialist.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440001',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441003',
        name: 'Bathroom Kitchen Installer',
        key: 'bathroom_kitchen_installer',
        description: 'Specialized in bathroom and kitchen plumbing installations',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/bathroom-installer.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440001',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655441004',
        name: 'Irrigation Technician',
        key: 'irrigation_technician',
        description: 'Expert in irrigation system installation and maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/irrigation.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440001',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ELECTRICIAN SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655442001',
        name: 'Lighting Specialist',
        key: 'lighting_specialist',
        description: 'Expert in lighting design, installation, and repair',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/lighting.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440002',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442002',
        name: 'Wiring Technician',
        key: 'wiring_technician',
        description: 'Specialized in electrical wiring and rewiring services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/wiring.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440002',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442003',
        name: 'Solar Installer',
        key: 'solar_installer',
        description: 'Expert in solar panel installation and maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/solar.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440002',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655442004',
        name: 'Security System Installer',
        key: 'security_system_installer',
        description: 'Specialized in security system installation and maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/security.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440002',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // CARPENTER SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655443001',
        name: 'Furniture Builder',
        key: 'furniture_builder',
        description: 'Custom furniture design and construction',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/furniture.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440003',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655443002',
        name: 'Cabinet Installer',
        key: 'cabinet_installer',
        description: 'Kitchen and bathroom cabinet installation',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/cabinet.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440003',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655443003',
        name: 'Flooring Specialist',
        key: 'flooring_specialist',
        description: 'Hardwood, laminate, and specialty flooring installation',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/flooring.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440003',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655443004',
        name: 'Deck Builder',
        key: 'deck_builder',
        description: 'Outdoor deck and patio construction',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/deck.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440003',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // CLEANING SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655444001',
        name: 'House Cleaner',
        key: 'house_cleaner',
        description: 'Residential cleaning and housekeeping services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/house-clean.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440004',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655444002',
        name: 'Carpet Cleaner',
        key: 'carpet_cleaner',
        description: 'Professional carpet and upholstery cleaning',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/carpet-clean.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440004',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655444003',
        name: 'Window Cleaner',
        key: 'window_cleaner',
        description: 'Professional window and glass cleaning services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/window-clean.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440004',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655444004',
        name: 'Deep Cleaning Specialist',
        key: 'deep_cleaning_specialist',
        description: 'Intensive deep cleaning and sanitization services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/deep-clean.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440004',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655444005',
        name: 'Gutter Cleaner',
        key: 'gutter_cleaner',
        description: 'Gutter cleaning and maintenance services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/gutter-clean.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440004',
        level: 1,
        display_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // RENOVATION SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655445001',
        name: 'General Contractor',
        key: 'general_contractor',
        description: 'Complete renovation and construction project management',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/contractor.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440005',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655445002',
        name: 'Painter',
        key: 'painter',
        description: 'Interior and exterior painting services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/painter.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440005',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655445003',
        name: 'Tiler',
        key: 'tiler',
        description: 'Tile installation and repair services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/tiler.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440005',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655445004',
        name: 'Roofer',
        key: 'roofer',
        description: 'Roofing installation, repair, and maintenance',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/roofer.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440005',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // OTHER SUBCATEGORIES
      {
        id: '550e8400-e29b-41d4-a716-446655446001',
        name: 'Locksmith',
        key: 'locksmith',
        description: 'Lock installation, repair, and security services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/locksmith.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440006',
        level: 1,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655446002',
        name: 'Gardener/ Landscaper',
        key: 'gardener_landscaper',
        description: 'Garden maintenance and landscaping services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/gardener.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440006',
        level: 1,
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655446003',
        name: 'Pest Control Specialist',
        key: 'pest_control_specialist',
        description: 'Pest inspection, treatment, and prevention services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/pest-control.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440006',
        level: 1,
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655446004',
        name: 'HVAC Technician',
        key: 'hvac_technician',
        description: 'Heating, ventilation, and air conditioning services',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/hvac.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440006',
        level: 1,
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655446005',
        name: 'Curtain/ Blind Installer',
        key: 'curtain_blind_installer',
        description: 'Window treatment installation and repair',
        icon_url: 'https://myusta-images-videos.s3.amazonaws.com/icons/curtain.svg',
        parent_id: '550e8400-e29b-41d4-a716-446655440006',
        level: 1,
        display_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', subcategories);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', {
      level: 1
    }, {});
  }
};