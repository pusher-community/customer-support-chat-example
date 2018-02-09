(function () {
    'use strict';

    const PUSHER_INSTANCE_LOCATOR = "INSTANCE_LOCATOR"

    // ----------------------------------------------------
    // Chat Details
    // ----------------------------------------------------

    let chat = {
        rooms: [],
        messages: [],
        currentUser: false,
        currentUser: false,
    }


    // ----------------------------------------------------
    // Targeted Elements
    // ----------------------------------------------------

    const chatBody = $(document)
    const chatRoomsList = $('#rooms')
    const chatReplyMessage = $('#replyMessage')

    // ----------------------------------------------------
    // Helpers
    // ----------------------------------------------------

    const helpers = {
        /**
         * Clear the chat messages UI
         */
        clearChatMessages: () => $('#chat-msgs').html(''),

        /**
         * Add a new chat message to the chat window.
         */
        displayChatMessage: (message) => {
            if (chat.messages[message.id] === undefined) {
                chat.messages[message.id] = message

                $('#chat-msgs').prepend(
                    `<tr>
                        <td>
                            <div class="sender">${message.sender.name} @ <span class="date">${message.createdAt}</span></div>
                            <div class="message">${message.text}</div>
                        </td>
                    </tr>`
                )
            }
        },

        /**
         * Load chatroom with messages
         */
        loadChatRoom: evt => {
            chat.currentRoom = chat.rooms[$(evt.target).data('room-id')]

            if (chat.currentRoom !== undefined) {
                $('.response').show()
                $('#room-title').text(chat.currentRoom.name)

                chat.currentUser.fetchMessagesFromRoom(chat.currentRoom, {}, msgs => {
                    msgs.forEach(message => helpers.displayChatMessage(message))

                    chat.currentUser.subscribeToRoom(chat.currentRoom, {
                        newMessage: message => helpers.displayChatMessage(message)
                    })
                })
            }

            evt.preventDefault()
            helpers.clearChatMessages()
        },

        /**
         * Reply a message
         */
        replyMessage: evt => {
            evt.preventDefault()

            const message = $('#replyMessage input').val().trim()

            chat.currentUser.sendMessage(
                {text: message, roomId: chat.currentRoom.id},
                msgId => console.log("Message added!"),
                error => console.log(`Error adding message to ${chat.currentRoom.id}: ${error}`)
            )

            $('#replyMessage input').val('')
        },

        /**
         * Load the pusher chat manager
         */
        loadChatManager: () => {
            const chatManager = new Chatkit.ChatManager({
                userId: "chatkit-dashboard",
                instanceLocator: PUSHER_INSTANCE_LOCATOR,
                tokenProvider: new Chatkit.TokenProvider({url: "/session/auth", userId: 'chatkit-dashboard'}),
            });

            chatManager.connect({
                onSuccess: user => {
                    chat.currentUser = user

                    // Get all rooms and put a link on the sidebar...
                    user.rooms.forEach(room => {
                        if ( ! chat.rooms[room.id]) {
                            chat.rooms[room.id] = room

                            $('#rooms').append(
                                `<li class="nav-item"><a data-room-id="${room.id}" class="nav-link" href="#">${room.name}</a></li>`
                            )
                        }
                    })
                }
            })
        }
    }


    // ----------------------------------------------------
    // Register page event listeners
    // ----------------------------------------------------

    chatBody.ready(helpers.loadChatManager)
    chatReplyMessage.on('submit', helpers.replyMessage)
    chatRoomsList.on('click', 'li', helpers.loadChatRoom)
}())
