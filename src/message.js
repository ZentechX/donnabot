/*
 * message.js
 * This file contains your bot code
 */

const recastai = require('recastai')
const GoogleSpreadsheet = require('google-spreadsheet');
const creds = require('../client_secret.json');
const doc = new GoogleSpreadsheet('1HW2nWhGTBHZF7n4Yk1zMavPk9-hCBXDn9mfyFleozsY');

// This function is the core of the bot behaviour
const replyMessage = (message) => {
  // Instantiate Recast.AI SDK, just for request service
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  // Get text from message received
  const text = message.content

  console.log('I receive: ', text)

  // Get sendesrId to catch unique conversation_token
  const senderId = message.senderId

  // Call Recast.AI SDK, through /converse route
  request.converseText(text, { conversationToken: senderId })
  .then(result => {
    /*
    * YOUR OWN CODE
    * Here, you can add your own process.
    * Ex: You can call any external API
    * Or: Update your mongo DB
    * etc...
    */
    if(result.action.slug == 'order-product'){
      const amount = result.entities.number[0].scalar;
      const product = result.entities.order_product[0].value;

      doc.useServiceAccountAuth(creds, function (err) {

        doc.addRow(1, { name: 'zenno', order_product: product, amount : amount }, function(err) {
        if(err) {
          console.log(err);
        }
      });
    });

    }


    if (result.action) {
      console.log('The conversation action is: ', result.action.slug)
    }

    // If there is not any message return by Recast.AI for this current conversation
    if (!result.replies.length) {
      message.addReply({ type: 'text', content: 'I don\'t have the reply to this yet :)' })
    } else {
      // Add each reply received from API to replies stack
      result.replies.forEach(replyContent => message.addReply({ type: 'text', content: replyContent }))
    }

    // Send all replies
    message.reply()
    .then(() => {
      // Do some code after sending messages
    })
    .catch(err => {
      console.error('Error while sending message to channel', err)
    })
  })
  .catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

module.exports = replyMessage
