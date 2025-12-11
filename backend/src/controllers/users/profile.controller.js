

import * as profileService from "../../services/users/profile.service.js";


export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfileByUserId(req.user.id);
    
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    
    const userFields = ["first_name", "last_name"];
    const profileFields = ["bio", "avatar_url", "headline", "social_links"];
    
    const userUpdateData = {};
    const profileUpdateData = {};
    
    
    for (const field of userFields) {
      if (req.body[field] !== undefined) {
        userUpdateData[field] = req.body[field];
      }
    }
    
    
    for (const field of profileFields) {
      if (req.body[field] !== undefined) {
        profileUpdateData[field] = req.body[field];
      }
    }
    
    
    const result = await profileService.updateProfileAndUser(
      req.user.id,
      userUpdateData,
      profileUpdateData
    );
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
