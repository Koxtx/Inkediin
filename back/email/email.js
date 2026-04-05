const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = process.env.SENDGRID_SENDER; // ex: "noreply@tondomaine.com" (doit être vérifié dans SendGrid)

const sendConfirmationEmail = async (email, token) => {
  const backUrl = process.env.NODE_ENV === "production"
    ? process.env.DEPLOY_BACK_URL
    : process.env.API_URL;

  await sgMail.send({
    to: email,
    from: FROM,
    subject: "Confirmation d'inscription",
    html: `<p>Bienvenue ! Cliquez sur le lien suivant pour confirmer votre inscription : 
      <a href="${backUrl}/api/users/verifyMail/${token}">Confirmer l'inscription</a></p>`,
  });
};

const sendValidationAccount = async (email) => {
  await sgMail.send({
    to: email,
    from: FROM,
    subject: "Inscription validée",
    html: `<p>Bienvenue sur notre site ! Votre compte est confirmé. 
      <a href="${process.env.CLIENT_URL}/signin">Se connecter</a></p>`,
  });
};

const sendInvalidEmailToken = async (email) => {
  await sgMail.send({
    to: email,
    from: FROM,
    subject: "Problème lors de la validation",
    html: `<p>Votre lien a expiré. Veuillez vous réinscrire : 
      <a href="${process.env.CLIENT_URL}/signup">S'inscrire</a></p>`,
  });
};

const sendForgotPasswordEmail = async (email, token) => {
  await sgMail.send({
    to: email,
    from: FROM,
    subject: "Modification du mot de passe",
    html: `<p>Cliquez ici pour modifier votre mot de passe : 
      <a href="${process.env.CLIENT_URL}/resetpassword/${token}">Lien sécurisé</a></p>`,
  });
};

const validateNewPassword = async (email) => {
  await sgMail.send({
    to: email,
    from: FROM,
    subject: "Modification du mot de passe réussie",
    html: `<p>Votre mot de passe a bien été modifié. 
      <a href="${process.env.CLIENT_URL}/signin">Se connecter</a></p>`,
  });
};

module.exports = {
  sendConfirmationEmail,
  sendValidationAccount,
  sendInvalidEmailToken,
  sendForgotPasswordEmail,
  validateNewPassword,
};