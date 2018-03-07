# Customer support chat example using Chatkit
How to create a customer support chat system using Pusher Chatkit

![](https://www.dropbox.com/s/8unv1hu1t3k34ti/Creating-a-customer-support-chat-widget-using-JavaScript-and-Chatkit.gif?raw=1)

## Installation
* [Create a Chatkit instance](https://pusher.com/chatkit)
* Once you have created a Chatkit instance, go to the **Inspector** tab and create a new user called `chatkit-dashboard`
* Clone or download the repository.
* `cd` into the repository (`cd customer-support-chat-example`)
* Copy the `config.example.js` file to `config.js` and replace the placeholder keys with your Chatkit application's keys.
* Remember to udpate the `PUSHER_INSTANCE_LOCATOR` variables in [`assets/admin.js`](https://github.com/neoighodaro/customer-support-chat-example/blob/master/assets/admin.js) and [`assets/chat.js`](https://github.com/neoighodaro/customer-support-chat-example/blob/master/assets/chat.js)
* Run `npm install` to install dependencies then `node index.js` to run the server
* Open http://localhost:3000 and http://localhost:3000/admin on your browser


