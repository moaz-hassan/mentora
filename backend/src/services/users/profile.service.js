import profileRepository from "../../repositories/auth/profile.repository.js";
import userRepository from "../../repositories/auth/user.repository.js";

export const getProfileByUserId = async (userId) => {
  let profile = await profileRepository.findByUserId(userId);

  if (!profile) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    profile = await profileRepository.create({
      user_id: userId,
      bio: user.profile?.bio || "",
      avatar_url: user.profile?.avatar_url || "",
      headline: user.profile?.headline || "",
      social_links: user.profile?.social_links || {},
    });
  }

  return profile.toJSON();
};

export const updateProfile = async (userId, profileData) => {
  const allowedData = {};
  if (profileData.bio !== undefined) allowedData.bio = profileData.bio;
  if (profileData.avatar_url !== undefined) allowedData.avatar_url = profileData.avatar_url;
  if (profileData.headline !== undefined) allowedData.headline = profileData.headline;
  if (profileData.social_links !== undefined) allowedData.social_links = profileData.social_links;

  const profile = await profileRepository.updateByUserId(userId, allowedData);

  // Sync to User embedded profile as well
  await userRepository.updateById(userId, {
    "profile.bio": profile.bio,
    "profile.avatar_url": profile.avatar_url,
    "profile.headline": profile.headline,
    "profile.social_links": profile.social_links,
  });

  return profile.toJSON();
};

export const updateProfileAndUser = async (userId, userUpdateData, profileUpdateData) => {
  let updatedUser = null;
  let updatedProfile = null;

  if (userUpdateData && Object.keys(userUpdateData).length > 0) {
    const allowedUserData = {};
    if (userUpdateData.first_name !== undefined) {
      allowedUserData.first_name = userUpdateData.first_name;
    }
    if (userUpdateData.last_name !== undefined) {
      allowedUserData.last_name = userUpdateData.last_name;
    }

    const user = await userRepository.updateById(userId, allowedUserData);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    updatedUser = user.toJSON();
  }

  if (profileUpdateData && Object.keys(profileUpdateData).length > 0) {
    updatedProfile = await updateProfile(userId, profileUpdateData);
  }

  return {
    user: updatedUser,
    profile: updatedProfile,
  };
};

export default {
  getProfileByUserId,
  updateProfile,
  updateProfileAndUser,
};
