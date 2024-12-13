const { body } = require('express-validator');

const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('유효한 이메일을 입력해 주세요'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
    body('firstName')
        .notEmpty()
        .withMessage('이름은 필수입니다'),
    body('lastName')
        .notEmpty()
        .withMessage('성은 필수입니다'),
    body('role')
        .optional()
        .isIn(['user', 'doctor', 'admin'])
        .withMessage('유효하지 않은 역할입니다')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('유효한 이메일을 입력해 주세요'),
    body('password')
        .notEmpty()
        .withMessage('비밀번호는 필수입니다')
];

module.exports = {
    registerValidation,
    loginValidation
};