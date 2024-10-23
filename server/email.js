const nodemailer = require("nodemailer");


//function for authentication of username and password and get parameters subject and text from 
//api and then send the message to recipent email throudh nodemailer package

const sendEmail = async (subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email", //  Host
      port: 587,
      secure: false, 
      auth: {
        user: "emmanuelle.bergstrom@ethereal.email", // username
        pass: "6Fk37bw56bvk1NMHQJ", // password
      },
    });

    let info = await transporter.sendMail({
      from: "emmanuelle.bergstrom@ethereal.email", // sender address
      to: "asaaa@gmail.com", // list of receivers
      subject, // Subject line
      text, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email", error);
  }
};

module.exports = { sendEmail };
