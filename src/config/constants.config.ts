export enum ErrorCodes {
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  EMAIL_AND_PASSWORD_ARE_REQUIRE = 1004,
  EMAIL_IS_NOT_REQUIRE = 1005,

  UNAUTHORIZED = 2001,
  DONT_HAVE_PERMISSION = 2002,

  ROLE_NOT_FOUND = 3001,

  VALIDATE_ERROR = 4001,

  SERVER_ERROR = 5001,

  INVALID_REFRESH_TOKEN = 6001,
  REFRESH_TOKEN_IS_NULL = 6002,
  REFRESH_TOKEN_EXPIRED = 6003,

  SENT_EMAIL_FAIL = 7001,
  EMAIL_IS_NOT_VERIFIED = 7002,
  INVALID_EMAIL_TOKEN = 7003,
  EMAIL_TOKEN_NOT_FOUND = 7004,
  EMAIL_TOKEN_EXPIRED = 7005,
  EMAIL_HAS_BEEN_VERIFIED = 7006,
  INVALID_RESET_PASS_TOKEN = 7007,

  FILE_NOT_FOUND = 8000,
  FILE_SIZE_EXCEEDS = 8001,
  FORMAT_IS_NOT_SUPPORTED = 8002,
  FILE_PATH_INVALID = 8003,
  UPLOAD_FILE_ERROR = 8999,

  CATE_NOT_FOUND = 9000,
  CATE_NAME_IS_EXIST = 9001,

  ERROR_FORMAT = 10000,

  POST_NOT_FOUND = 11000,
  UPDATE_POST_ERROR = 11001,
  DELETE_POST_ERROR = 11002,
}
