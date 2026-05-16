 const User=require("../../models/Usermodel");
const sendMessageEmail = require("../../utils/sendMessageEmail");
const stripe = require('../../utils/stripe');
const Bazaar = require("../../models/Bazaar.model")
const stripeWebhook = async (req, res) => {

  const sig = req.headers["stripe-signature"];

  let event;

  try {

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    const bazaarId = session.metadata.bazaarId;

    const bazaar = await Bazaar.findById(bazaarId);

    if (bazaar) {

      bazaar.payment.status = "paid";

      bazaar.status = "open";

      await bazaar.save();

      // get owner
      const user = await User.findById(bazaar.owner);

      // send email
await sendMessageEmail(
  user.email,

  `
    Your bazaar has been approved successfully 🎉

    Login Credentials:

    Email: ${user.email}

    Password: ${user.temporaryPassword}
  `
        );
 user.temporaryPassword = null;

await user.save();
    }
  }

  res.json({ received: true });
};
module.exports = {
    stripeWebhook
}