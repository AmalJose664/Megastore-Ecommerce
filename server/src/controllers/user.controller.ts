import { Request, Response } from 'express';
import { userService, UserService } from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';

export class UserController {
  constructor(private userSer: UserService) {}

  /**
   * GET /api/v1/users
   * Get all users (Admin only)
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as any,
      role: req.query.role as any,
    };

    const users = await this.userSer.getAllUsers(filters);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  });

  /**
   * GET /api/v1/users/:id
   * Get user by ID with order details (Admin only)
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = await this.userSer.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: userData,
    });
  });

  /**
   * PATCH /api/v1/users/:id/status
   * Toggle user active status (Admin only)
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive, status } = req.body;

    const updatedUser = await this.userSer.updateUserStatus(id, isActive, status);

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser,
    });
  });
}

export const userController = new UserController(userService);
