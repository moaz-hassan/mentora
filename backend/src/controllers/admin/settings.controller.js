

import * as settingsService from "../../services/admin/settings.service.js";


export const getAllSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getAllSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};


export const getSettingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const settings = await settingsService.getSettingsByCategory(category);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};


export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = req.user.id;

    const setting = await settingsService.updateSetting(key, value, adminId);

    res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: setting
    });
  } catch (error) {
    next(error);
  }
};


export const bulkUpdateSettings = async (req, res, next) => {
  try {
    const { updates } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates must be an array"
      });
    }

    const results = await settingsService.bulkUpdateSettings(updates, adminId);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Updated ${successCount} settings, ${failCount} failed`,
      data: results
    });
  } catch (error) {
    next(error);
  }
};


export const createSetting = async (req, res, next) => {
  try {
    const setting = await settingsService.createSetting(req.body);

    res.status(201).json({
      success: true,
      message: "Setting created successfully",
      data: setting
    });
  } catch (error) {
    next(error);
  }
};


export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getPublicSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
