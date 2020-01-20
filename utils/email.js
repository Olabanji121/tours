const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Admin<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // send grid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

   async send(template, subject) {
    // 1) render  HTML based on pug template
       const html=  pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {firstName: this.firstName, url: this.url, subject})

    // 2) define the email option
    const mailOptions = { 
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) create a transport and send email 
    await this.newTransport().sendMail(mailOptions);

  }

   async sendWelcome() {
   await this.send('Welcome', 'Welcome to the Natours Family!');
  }
};




// const sendEmail = async options =>{
//     // 1) create a transporter
//         const transporter = nodemailer.createTransport({
//             host: process.env.EMAIL_HOST,
//             port:process.env.EMAIL_PORT,
//             auth: {
//                 user: process.env.EMAIL_USERNAME,
//                 pass: process.env.EMAIL_PASSWORD
//             }
//             // Activate in gmail 'less secure app option
//         })
//     // 2) define the email options
//         const mailOptions ={
//             from: 'Admin <noreply@asodev.com>',
//             to: options.email,
//             subject: options.subject,
//             text: options.message,
//             // html:
//         }
//     // 3) send the email

//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail
