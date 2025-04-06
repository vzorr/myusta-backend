const { User } = require('../models');
const bcrypt = require('bcrypt');
const { uploadImage } = require('../utils/imageUtils');

exports.accountCreation = async (userId, { firstName, lastName, phoneNumber, password, imageUrl }) => {
  try {
    // Check if the user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return { success: false, message: 'User not found', errors: ['User not found'] };
    }

    // Hash the password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

    // Upload image if provided
    let profileImage = user.imageUrl;
    // if (imageUrl) {
    //   profileImage = await uploadImage(imageUrl);
    // }

    // Update or create user information
    await User.update(
      { firstName, lastName, phone: phoneNumber, password: hashedPassword, imageUrl: profileImage },
      { where: { id: userId } }
    );

    return {
      success: true,
      message: 'User information updated successfully',
      data: {
        userId,
        firstName,
        lastName,
        phoneNumber,
        profileImage,
      },
    };
  } catch (error) {
    console.error('Error in accountCreation service:', error);
    return { success: false, message: error.message };
  }
};
