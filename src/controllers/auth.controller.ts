import { Request, Response } from 'express';
import { authService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);

    res.json({
      success: true,
      data: { tokens },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.userId);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const message = await authService.forgotPassword(email);

    res.json({
      success: true,
      message,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    // This would be implemented with a UserService
    res.json({
      success: true,
      data: req.user,
    });
  });
}

export const authController = new AuthController();