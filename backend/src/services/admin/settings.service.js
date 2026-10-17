

import settingsRepository from "../../repositories/admin/settings.repository.js";

const DEFAULT_CATEGORY = "general";
const DEFAULT_DATA_TYPE = "string";
const VALID_DATA_TYPES = ["string", "number", "boolean", "json"];

const notFoundError = () => {
  const error = new Error("Setting not found");
  error.statusCode = 404;
  return error;
};

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const toApiShape = (setting) => ({
  key: setting.key,
  value: setting.value,
  dataType: setting.data_type,
  description: setting.description,
  isPublic: setting.is_public,
});

const normalizeSettingData = (settingData = {}) => {
  const requestedDataType = settingData.data_type ?? settingData.dataType;

  return {
    key:
      typeof settingData.key === "string"
        ? settingData.key.trim()
        : settingData.key,
    value: settingData.value,
    description: settingData.description || "",
    category: settingData.category || DEFAULT_CATEGORY,
    data_type: VALID_DATA_TYPES.includes(requestedDataType)
      ? requestedDataType
      : DEFAULT_DATA_TYPE,
    is_public: Boolean(settingData.is_public ?? settingData.isPublic ?? false),
  };
};


export const getAllSettings = async () => {
  const settings = await settingsRepository.findAllSorted();

  const grouped = {};
  settings.forEach((setting) => {
    const category = setting.category || DEFAULT_CATEGORY;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(toApiShape(setting));
  });

  return grouped;
};


export const getSettingsByCategory = async (category) => {
  const settings = await settingsRepository.findByCategory(category);

  return settings.map(toApiShape);
};


export const getSettingByKey = async (key) => {
  const setting = await settingsRepository.findByKey(key);

  if (!setting) {
    throw notFoundError();
  }

  return setting;
};


export const updateSetting = async (key, value, adminId) => {
  // adminId is reserved for the audit trail once structured logging lands (FND-04).
  const setting = await settingsRepository.findByKey(key);

  if (!setting) {
    throw notFoundError();
  }

  const validatedValue = validateSettingValue(
    value,
    setting.data_type || DEFAULT_DATA_TYPE
  );

  return await settingsRepository.updateByKey(key, { value: validatedValue });
};


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


export const createSetting = async (settingData) => {
  const normalized = normalizeSettingData(settingData);

  if (!normalized.key) {
    throw validationError("Setting key is required");
  }

  if (normalized.value === undefined || normalized.value === null) {
    throw validationError("Setting value is required");
  }

  const existing = await settingsRepository.findByKey(normalized.key);

  if (existing) {
    throw validationError("Setting with this key already exists");
  }

  return await settingsRepository.create(normalized);
};


function validateSettingValue(value, dataType = DEFAULT_DATA_TYPE) {
  switch (dataType) {
    case "number": {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw validationError("Invalid number value");
      }
      return num.toString();
    }

    case "boolean": {
      if (value === "true" || value === true) return "true";
      if (value === "false" || value === false) return "false";
      throw validationError("Invalid boolean value");
    }

    case "json": {
      try {
        JSON.parse(typeof value === "string" ? value : JSON.stringify(value));
        return value;
      } catch (e) {
        throw validationError("Invalid JSON value");
      }
    }

    case "string":
    default:
      return value === null || value === undefined ? "" : String(value);
  }
}


export const getPublicSettings = async () => {
  const settings = await settingsRepository.findPublic();

  const publicSettings = {};
  settings.forEach((setting) => {
    publicSettings[setting.key] = setting.value;
  });

  return publicSettings;
};
