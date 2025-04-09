import fs from 'fs/promises';
import path from 'path';

// Delete static file
export async function deleteFile(fileName: string) {
  try {
    const filePath = path.join('./public/images/', fileName);
    console.log(filePath);

    await fs.unlink(filePath);
    return;
  } catch (error) {
    throw error;
  }
}
