import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../config/logger.js";
import { error } from "winston";

class EmailService{
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: env.MAIL.HOST,
            port : Number(env.MAIL.PORT),
            secure : false,
            auth : {
                user :env.MAIL.USER,
                pass: env.MAIL.PASSWORD
            }
        }),
        this.transporter.verify()
        .then(()=> logger.info("SMTP Connected"))
        .catch(error => logger.error(error.message));
    }

    async sendEmail({
        to,
        subject,
        html
    }){
        try{
            await this.transporter.sendMail({
                from : env.MAIL.FROM,
                to,
                subject,
                html
            });
            logger.info(`Email sent to ${to}`);
        }catch(error){
            logger.error(error.stack);
            throw error;
        }
    }
}

export default new EmailService();