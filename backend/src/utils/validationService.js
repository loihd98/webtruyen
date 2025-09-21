const validator = require("validator");

class ValidationService {
  validateEmail(email) {
    if (!email) {
      throw new Error("Email là bắt buộc");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Email không hợp lệ");
    }
    return true;
  }

  validatePassword(password) {
    if (!password) {
      throw new Error("Mật khẩu là bắt buộc");
    }
    if (password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    return true;
  }

  validateName(name) {
    if (!name) {
      throw new Error("Tên là bắt buộc");
    }
    if (name.length < 2) {
      throw new Error("Tên phải có ít nhất 2 ký tự");
    }
    if (name.length > 50) {
      throw new Error("Tên không được quá 50 ký tự");
    }
    return true;
  }

  validateStoryData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push("Tiêu đề truyện là bắt buộc");
    }

    if (data.title && data.title.length > 200) {
      errors.push("Tiêu đề không được quá 200 ký tự");
    }

    if (!["TEXT", "AUDIO"].includes(data.type)) {
      errors.push("Loại truyện phải là TEXT hoặc AUDIO");
    }

    if (data.description && data.description.length > 2000) {
      errors.push("Mô tả không được quá 2000 ký tự");
    }

    if (errors.length > 0) {
      const error = new Error("Dữ liệu không hợp lệ");
      error.name = "ValidationError";
      error.details = errors;
      throw error;
    }

    return true;
  }

  validateChapterData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push("Tiêu đề chương là bắt buộc");
    }

    if (data.title && data.title.length > 200) {
      errors.push("Tiêu đề chương không được quá 200 ký tự");
    }

    if (data.number === undefined || data.number < 1) {
      errors.push("Số chương phải là số nguyên dương");
    }

    if (errors.length > 0) {
      const error = new Error("Dữ liệu chương không hợp lệ");
      error.name = "ValidationError";
      error.details = errors;
      throw error;
    }

    return true;
  }

  validateCommentData(data) {
    const errors = [];

    if (!data.content || data.content.trim().length === 0) {
      errors.push("Nội dung bình luận là bắt buộc");
    }

    if (data.content && data.content.length > 1000) {
      errors.push("Bình luận không được quá 1000 ký tự");
    }

    if (errors.length > 0) {
      const error = new Error("Dữ liệu bình luận không hợp lệ");
      error.name = "ValidationError";
      error.details = errors;
      throw error;
    }

    return true;
  }
}

module.exports = new ValidationService();
