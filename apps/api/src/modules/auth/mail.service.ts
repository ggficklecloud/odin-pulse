import nodemailer from "nodemailer";

import { env } from "../../config/env.js";

export class MailService {
  private readonly transporter =
    env.SMTP_HOST && env.SMTP_FROM
      ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth:
            env.SMTP_USER || env.SMTP_PASSWORD
              ? {
                  user: env.SMTP_USER,
                  pass: env.SMTP_PASSWORD,
                }
              : undefined,
        })
      : null;

  async sendVerificationCode(email: string, code: string, type: "login" | "password") {
    if (!this.transporter || !env.SMTP_FROM) {
      throw new Error("SMTP is not configured");
    }

    const subject =
      type === "password" ? "Odin Pulse 密码修改验证码" : "Odin Pulse 登录验证码";
    const text =
      type === "password"
        ? `你的密码修改验证码是 ${code}，10 分钟内有效。`
        : `你的登录验证码是 ${code}，10 分钟内有效。`;

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject,
      text,
    });
  }
}
