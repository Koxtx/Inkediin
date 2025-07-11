const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation d'inscription",
    html: `<p>Bienvenue sur notre site ! Cliquez sur le lien suivant pour confirmer l'inscription : <a href="${process.env.API_URL}/api/users/verifyMail/${token}">Confirmer l'inscription</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendValidationAccount = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Inscription validée",
    html: `<p>Bienvenue sur notre site ! Cliquez sur le lien suivant pour vous connecter : <a href="${process.env.CLIENT_URL}/signin">Se connecter</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendInvalidEmailToken = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Problème lors de la validation",
    html: `<p>Token expiré ! Veuillez vous réinscrire : <a href="${process.env.CLIENT_URL}/signup">S'inscrire'</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendForgotPasswordEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Modification du mot de passe",
    html: `<p>Cliquez ici pour modifier votre mot de passe <a href="${process.env.CLIENT_URL}/resetpassword/${token}">Lien sécurisé</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const validateNewPassword = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Modification du mot de passe réussie",
    html: `<p>Votre mot de passe a bien été modifié. Veuillez vous connecter</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendConfirmationEmail,
  sendValidationAccount,
  sendInvalidEmailToken,
  sendForgotPasswordEmail,
  validateNewPassword,
};
