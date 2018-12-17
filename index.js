// ----------------------------------------------------------------------------
// Load dependencies...
// ----------------------------------------------------------------------------

const path       = require('path')
const express    = require('express')
const bodyParser = require('body-parser');
const Chatkit    = require('@pusher/chatkit-server')


// ----------------------------------------------------------------------------
// Instantiate Express and Chatkit
// ----------------------------------------------------------------------------

const app = express()
const chatkit = new Chatkit.default(require('./config.js'));


// ----------------------------------------------------------------------------
// Load Express Middlewares
// ----------------------------------------------------------------------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'assets')))


// ----------------------------------------------------------------------------
// Define Routes
// ----------------------------------------------------------------------------

app.post('/session/load', (req, res, next) => {

    // Attempt to create a new user with the email will serving as the ID of the user.
    // If there is no user matching the ID, we create one but if there is one we skip
    // creating and go straight into fetching the chat room for that user

    chatkit.createUser({ id: req.body.email, name: req.body.name })
        .then(() => getUserRoom(req, res, next, false))
        .catch(err => {
            (err.error_type === 'services/chatkit/user_already_exists')
                ? getUserRoom(req, res, next, true)
                : next(err)
        })

    function getUserRoom(req, res, next, existingAccount) {
        const name  = req.body.name
        const email = req.body.email

        // Get the list of users the user belongs to. Check within that room list for one
        // whose name matches the user's ID. If we find one, we return that as the response,
        //  else we create the room and return it as the response.

        chatkit.apiRequest({method: 'GET', 'path': `/users/${email}/rooms`})
            .then(rooms => {
                let clientRoom = false

                // Loop through user rooms to see if there is already a room for the client
                rooms.forEach(room => (room.name === email ? (clientRoom = room) : false))

                if (clientRoom && clientRoom.id) {
                    return res.json(clientRoom)
                }

                const createRoomRequest = {
                    method: 'POST',
                    path: '/rooms',
                    jwt: chatkit.generateAccessToken({ userId: email }).token,
                    body: { name: email, private: true, user_ids: ['chatkit-dashboard'] },
                };

                // Since we can't find a client room, we will create one and return that.
                chatkit.apiRequest(createRoomRequest)
                       .then(room => res.json(room))
                       .catch(err => next(new Error(`${err.error_type} - ${err.error_description}`)))
            })
            .catch(err => next(new Error(`ERROR: ${err.error_type} - ${err.error_description}`)))
    }
})

app.post('/session/auth', (req, res) => {
    const authData = chatkit.authenticate({
        userId: req.query.user_id
    })

    res.status(authData.status).send(authData.body)
})

app.get('/admin', (req, res) => {
    res.sendFile('admin.html', {root: __dirname + '/views'})
})

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname + '/views'})
})


// ----------------------------------------------------------------------------
// Start Express Application
// ----------------------------------------------------------------------------

app.listen(3000, () => console.log("Application listening on port 3000!!!"))
