import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No image file uploaded', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return sendSuccess(res, { url: fileUrl }, 'Image uploaded successfully', 201);
};
