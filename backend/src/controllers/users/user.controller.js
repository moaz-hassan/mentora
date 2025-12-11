

import * as userService from "../../services/users/user.service.js";


export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};


export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};


export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await user.update({ is_active: !user.is_active });

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.is_active ? "activated" : "deactivated"} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};


export const becomeInstructor = async (req, res, next) => {
  try {
    const user = await userService.becomeInstructor(req.user.id);

    res.status(200).json({
      success: true,
      message: "Congratulations! You are now an instructor. You can start creating courses.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

