import { Request, Response } from 'express';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload';

export class UploadController {
  static async uploadToCloudinary(req: Request, res: Response) {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const result = await uploadBufferToCloudinary(file.buffer);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: 'Upload failed' });
    }
  }
}
