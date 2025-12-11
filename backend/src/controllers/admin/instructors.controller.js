

import * as instructorService from "../../services/admin/instructorManagement.service.js";


export const getAllInstructors = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };

    const instructors = await instructorService.getAllInstructors(filters);

    res.status(200).json({
      success: true,
      count: instructors.length,
      data: instructors
    });
  } catch (error) {
    next(error);
  }
};


export const getInstructorDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructor = await instructorService.getInstructorDetails(id);

    res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
};


export const getInstructorAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const performance = await instructorService.getInstructorPerformance(id);

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    next(error);
  }
};


export const updateInstructorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean"
      });
    }

    const instructor = await instructorService.updateInstructorStatus(id, isActive);

    res.status(200).json({
      success: true,
      message: `Instructor ${isActive ? "activated" : "suspended"} successfully`,
      data: instructor
    });
  } catch (error) {
    next(error);
  }
};


export const getInstructorPayouts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payouts = await instructorService.getInstructorPayoutHistory(id);

    res.status(200).json({
      success: true,
      count: payouts.length,
      data: payouts
    });
  } catch (error) {
    next(error);
  }
};
