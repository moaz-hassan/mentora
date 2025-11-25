/**
 * Settings Service
 * Purpose: Handle system settings management
 */

import models from "../../models/index.js";

const { Settings } = models;

/**
 * Get all settings
 */
export const getAllSettings = async () => {
  const settings = await Settings.findAll({
    order: [["category", "ASC"], ["key", "ASC"]]
  });

  // Group by category
  const grouped = {};
  settings.forEach(setting => {
    if (!grouped[setting.category]) {
      grouped[setting.category] = [];
    }
    grouped[setting.category].push({
      key: setting.key,
      value: setting.value,
      dataType: setting.data_type,
      description: setting.description,
      isPublic: setting.is_public
    });
  });

  return grouped;
};

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (category) => {
  const settings = await Settings.findAll({
    where: { category },
    order: [["key", "ASC"]]
  });

  return settings.map(setting => ({
    key: setting.key,
    value: setting.value,
    dataType: setting.data_type,
    description: setting.description,
    isPublic: setting.is_public
  }));
};

/**
 * Get single setting by key
 */
export const getSettingByKey = async (key) => {
  const setting = await Settings.findOne({ where: { key } });
  
  if (!setting) {
    const error = new Error("Setting not found");
    error.statusCode = 404;
    throw error;
  }

  return setting;
};

/**
 * Update setting
 */
export const updateSetting = async (key, value, adminId) => {
  const setting = await Settings.findOne({ where: { key } });
  
  if (!setting) {
    const error = new Error("Setting not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate value based on data type
  const validatedValue = validateSettingValue(value, setting.data_type);
  
  setting.value = validatedValue;
  await setting.save();

  // Log the change (would integrate with audit logging)
  console.log(`Setting ${key} updated by admin ${adminId}`);

  return setting;
};

/**
 * Bulk update settings
 */
export const bulkUpdateSettings = async (updates, adminId) => {
  const results = [];
  
  for (const update of updates) {
    try {
      const setting = await updateSetting(update.key, update.value, adminId);
      results.push({
        key: update.key,
        success: true,
        setting
      });
    } catch (error) {
      results.push({
        key: update.key,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Create new setting
 */
export const createSetting = async (settingData) => {
  // Check if setting already exists
  const existing = await Settings.findOne({ where: { key: settingData.key } });
  
  if (existing) {
    const error = new Error("Setting with this key already exists");
    error.statusCode = 400;
    throw error;
  }

  const setting = await Settings.create(settingData);
  return setting;
};

/**
 * Validate setting value based on data type
 */
function validateSettingValue(value, dataType) {
  switch (dataType) {
    case "number":
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error("Invalid number value");
      }
      return num.toString();
      
    case "boolean":
      if (value === "true" || value === true) return "true";
      if (value === "false" || value === false) return "false";
      throw new Error("Invalid boolean value");
      
    case "json":
      try {
        JSON.parse(value);
        return value;
      } catch (e) {
        throw new Error("Invalid JSON value");
      }
      
    case "string":
    default:
      return value.toString();
  }
}

/**
 * Get public settings (for frontend)
 */
export const getPublicSettings = async () => {
  const settings = await Settings.findAll({
    where: { is_public: true }
  });

  const publicSettings = {};
  settings.forEach(setting => {
    publicSettings[setting.key] = setting.value;
  });

  return publicSettings;
};
