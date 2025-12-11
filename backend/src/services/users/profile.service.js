

import models from "../../models/index.js";
import { sequelize } from "../../config/db.js";

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


export const updateProfile = async (userId, updateData) => {
  
  const profile = await Profile.findOne({
    where: { user_id: userId }
  });

  if (!profile) {
    
    const newProfile = await Profile.create({
      user_id: userId,
      ...updateData
    });
    return newProfile;
  }

  
  await profile.update(updateData);
  return profile;
};


export const updateProfileAndUser = async (userId, userUpdateData, profileUpdateData) => {
  
  const transaction = await sequelize.transaction();

  try {
    let updatedUser = null;
    let updatedProfile = null;

    
    if (Object.keys(userUpdateData).length > 0) {
      const user = await User.findByPk(userId, { transaction });

      if (!user) {
        await transaction.rollback();
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      
      const allowedUserData = {};
      if (userUpdateData.first_name !== undefined) {
        allowedUserData.first_name = userUpdateData.first_name;
      }
      if (userUpdateData.last_name !== undefined) {
        allowedUserData.last_name = userUpdateData.last_name;
      }

      await user.update(allowedUserData, { transaction });
      updatedUser = user.toJSON();
      delete updatedUser.password; 
    }

    
    if (Object.keys(profileUpdateData).length > 0) {
      let profile = await Profile.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!profile) {
        
        profile = await Profile.create(
          {
            user_id: userId,
            ...profileUpdateData,
          },
          { transaction }
        );
      } else {
        
        await profile.update(profileUpdateData, { transaction });
      }

      updatedProfile = profile.toJSON();
    }

    
    await transaction.commit();

    
    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  } catch (error) {
    
    await transaction.rollback();
    throw error;
  }
};
