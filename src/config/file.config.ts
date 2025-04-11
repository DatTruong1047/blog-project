export const uploadFileConfig = {
  limits: {
    fieldNameSize: 100, // Max 100 bytes
    fieldSize: 100 * 1024, // Max field value size 100kb
    fields: 10, // Max number of non-file -fields
    files: 5, // Max number of file fields
    fileSize: 5 * 1024 * 1024, // 1MB
  },
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  uploadUserDir: './public/images/users',
  uploadPostDir: './public/images/posts',
};
