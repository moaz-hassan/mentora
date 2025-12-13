


export const validateFirstName = (firstName) => {
  if (!firstName) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = firstName.trim();

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "First name must be at least 2 characters long",
    };
  }

  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: "First name must not exceed 255 characters",
    };
  }

  return { isValid: true, error: "" };
};


export const validateLastName = (lastName) => {
  if (!lastName) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = lastName.trim();

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "Last name must be at least 2 characters long",
    };
  }

  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: "Last name must not exceed 255 characters",
    };
  }

  return { isValid: true, error: "" };
};


export const validateBio = (bio) => {
  if (!bio) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = bio.trim();

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: "Bio must not exceed 5000 characters",
    };
  }

  return { isValid: true, error: "" };
};


export const validateHeadline = (headline) => {
  if (!headline) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = headline.trim();

  if (trimmed.length > 255) {
    return {
      isValid: false,
      error: "Headline must not exceed 255 characters",
    };
  }

  return { isValid: true, error: "" };
};


export const validateUrl = (url) => {
  if (!url) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = url.trim();

  // URL validation regex
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  if (!urlRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid URL (e.g., https://example.com or example.com/profile)",
    };
  }

  return { isValid: true, error: "" };
};


export const validateAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return { isValid: true, error: "" }; 
  }

  const trimmed = avatarUrl.trim();

  try {
    new URL(trimmed);
    return { isValid: true, error: "" };
  } catch {
    return {
      isValid: false,
      error: "Avatar URL must be a valid URL",
    };
  }
};


export const validateSocialLinks = (socialLinks) => {
  if (!socialLinks || typeof socialLinks !== "object") {
    return { isValid: true, errors: {} }; 
  }

  const validPlatforms = [
    "twitter",
    "linkedin",
    "github",
    "website",
    "facebook",
    "instagram",
    "youtube",
  ];

  const errors = {};
  let hasErrors = false;

  Object.keys(socialLinks).forEach((platform) => {
    
    if (!validPlatforms.includes(platform.toLowerCase())) {
      errors[platform] = `Invalid platform: ${platform}`;
      hasErrors = true;
      return;
    }

    const url = socialLinks[platform];

    
    if (!url || !url.trim()) {
      return;
    }

    
    const validation = validateUrl(url);
    if (!validation.isValid) {
      errors[platform] = validation.error;
      hasErrors = true;
    }
  });

  return {
    isValid: !hasErrors,
    errors,
  };
};


export const validateProfileUpdate = (profileData) => {
  const errors = {};

  
  if (profileData.first_name !== undefined) {
    const firstNameValidation = validateFirstName(profileData.first_name);
    if (!firstNameValidation.isValid) {
      errors.first_name = firstNameValidation.error;
    }
  }

  if (profileData.last_name !== undefined) {
    const lastNameValidation = validateLastName(profileData.last_name);
    if (!lastNameValidation.isValid) {
      errors.last_name = lastNameValidation.error;
    }
  }

  
  if (profileData.bio !== undefined) {
    const bioValidation = validateBio(profileData.bio);
    if (!bioValidation.isValid) {
      errors.bio = bioValidation.error;
    }
  }

  if (profileData.headline !== undefined) {
    const headlineValidation = validateHeadline(profileData.headline);
    if (!headlineValidation.isValid) {
      errors.headline = headlineValidation.error;
    }
  }

  if (profileData.avatar_url !== undefined) {
    const avatarValidation = validateAvatarUrl(profileData.avatar_url);
    if (!avatarValidation.isValid) {
      errors.avatar_url = avatarValidation.error;
    }
  }

  if (profileData.social_links !== undefined) {
    const socialLinksValidation = validateSocialLinks(profileData.social_links);
    if (!socialLinksValidation.isValid) {
      errors.social_links = socialLinksValidation.errors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


export const sanitizeProfileData = (profileData) => {
  const sanitized = {};

  
  if (profileData.first_name?.trim()) {
    sanitized.first_name = profileData.first_name.trim();
  }

  if (profileData.last_name?.trim()) {
    sanitized.last_name = profileData.last_name.trim();
  }

  
  if (profileData.bio?.trim()) {
    sanitized.bio = profileData.bio.trim();
  }

  if (profileData.headline?.trim()) {
    sanitized.headline = profileData.headline.trim();
  }

  if (profileData.avatar_url?.trim()) {
    sanitized.avatar_url = profileData.avatar_url.trim();
  }

  
  if (profileData.social_links && typeof profileData.social_links === "object") {
    const filteredSocialLinks = {};

    Object.keys(profileData.social_links).forEach((platform) => {
      const url = profileData.social_links[platform]?.trim();
      if (url) {
        filteredSocialLinks[platform] = url;
      }
    });

    if (Object.keys(filteredSocialLinks).length > 0) {
      sanitized.social_links = filteredSocialLinks;
    }
  }

  return sanitized;
};
