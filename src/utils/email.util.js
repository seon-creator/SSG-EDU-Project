const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.mailgun.org",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
    // 인증번호 저장소 초기화
    this.verificationCodes = new Map();
  }

  async sendEmail(email, subject, html) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "Health Consultation",
          address: process.env.EMAIL_FROM_ADDRESS || "noreply@healthconsult.com"
        },
        to: email,
        subject: subject,
        html: html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("이메일이 성공적으로 전송되었습니다:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("이메일 전송 중 오류 발생:", error);
      throw error;
    }
  }

  // 이메일 템플릿
  getVerificationEmailTemplate(userName, verificationLink) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>이메일 인증</h2>
        <p>${userName}님,</p>
        <p>회원가입해 주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 주소를 인증해 주세요:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 4px;">
            이메일 인증
          </a>
        </div>
        <p>버튼이 작동하지 않으면 이 링크를 클릭해 주세요:</p>
        <p>${verificationLink}</p>
        <p>이 링크는 24시간 후에 만료됩니다.</p>
        <p>감사합니다,<br>Health Consultation 팀</p>
      </div>
    `;
  }

  getPasswordResetTemplate(userName, resetLink) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>비밀번호 재설정 요청</h2>
        <p>${userName}님,</p>
        <p>비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 새 비밀번호를 생성해 주세요:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 4px;">
            비밀번호 재설정
          </a>
        </div>
        <p>버튼이 작동하지 않으면 이 링크를 클릭해 주세요:</p>
        <p>${resetLink}</p>
        <p>이 링크는 1시간 후에 만료됩니다. 요청하지 않은 경우 이 이메일을 무시해 주세요.</p>
        <p>감사합니다,<br>Health Consultation 팀</p>
      </div>
    `;
  }
  // 인증번호 이메일 템플릿
  getCodeTemplate(code) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
        <h2 style="color: #4CAF50; margin-bottom: 20px;">이메일 인증 코드</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">아래 인증 코드를 사용하여 이메일 인증을 완료해 주세요:</p>
        <div style="margin: 0 auto; padding: 20px; background-color: #fff; border: 1px solid #ccc; border-radius: 8px; display: inline-block;">
          <strong style="font-size: 28px; color: #4CAF50;">${code}</strong>
        </div>
        <p style="font-size: 14px; color: #555; margin-top: 20px;">이 코드는 <strong>5분</strong> 후에 만료됩니다.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 14px; color: #555;">감사합니다</p>
      </div>
    `;
  }
}

module.exports = new EmailService();