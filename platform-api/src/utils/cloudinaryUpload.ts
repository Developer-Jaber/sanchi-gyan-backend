import { cloudinary } from '../config/cloudinary';

export function uploadBufferToCloudinary(buffer: Buffer, folder?: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder }, (error, uploadResult) => {
      if (error || !uploadResult) return reject(error || new Error('Upload failed'));
      resolve({ url: uploadResult.secure_url, publicId: uploadResult.public_id });
    });
    stream.end(buffer);
  });
}
