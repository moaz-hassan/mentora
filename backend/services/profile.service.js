

import models from "../models/index.model.js";
import { sequelize } from "../config/db.js";

const { Profile, User } = models;

export const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({
    where: { user_id: userId }
  });

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Update profile (legacy method for backward compatibility)
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated profile
 */
export const updateProfile = async (userId, updateData) => {
  // Find profile by user_id
  const profile = await Profile.findOne({
    where: { user_id: userId }
  });

  if (!profile) {
    // If profile doesn't exist, create one
    const newProfile = await Profile.create({
      user_id: userId,
      ...updateData
    });
    return newProfile;
  }

  // Update existing profile
  await profile.update(updateData);
  return profile;
};

/**
 * Update both user and profile data in a single transaction
 * @param {string} userId - User ID
 * @param {Object} userUpdateData - User data to update (first_name, last_name)
 * @param {Object} profileUpdateData - Profile data to update (bio, headline, etc.)
 * @returns {Object} Updated user with profile
 */
export const updateProfileAndUser = async (userId, userUpdateData, profileUpdateData) => {
  // Start a transaction to ensure both updates succeed or fail together
  const transaction = await sequelize.transaction();

  try {
    let updatedUser = null;
    let updatedProfile = null;

    // Update user data if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      const user = await User.findByPk(userId, { transaction });

      if (!user) {
        await transaction.rollback();
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      // Only allow updating first_name and last_name
      const allowedUserData = {};
      if (userUpdateData.first_name !== undefined) {
        allowedUserData.first_name = userUpdateData.first_name;
      }
      if (userUpdateData.last_name !== undefined) {
        allowedUserData.last_name = userUpdateData.last_name;
      }

      await user.update(allowedUserData, { transaction });
      updatedUser = user.toJSON();
      delete updatedUser.password; // Remove password from response
    }

    // Update profile data if there are changes
    if (Object.keys(profileUpdateData).length > 0) {
      let profile = await Profile.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!profile) {
        // If profile doesn't exist, create one
        profile = await Profile.create(
          {
            user_id: userId,
            ...profileUpdateData,
          },
          { transaction }
        );
      } else {
        // Update existing profile
        await profile.update(profileUpdateData, { transaction });
      }

      updatedProfile = profile.toJSON();
    }

    // Commit the transaction
    await transaction.commit();

    // Return combined result
    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    throw error;
  }
};