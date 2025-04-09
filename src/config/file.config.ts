export const uploadFileConfig = {
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  uploadUserDir: './public/images/users',
  uploadPostDir: './public/images/posts',
};
