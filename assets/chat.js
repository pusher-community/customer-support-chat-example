(function() {
    'use strict';

    const PUSHER_INSTANCE_LOCATOR = "INSTANCE_LOCATOR"

    // ----------------------------------------------------
    // Chat Details
    // ----------------------------------------------------

    let chat = {
        messages: [],
        room:  undefined,
        userId: undefined,
        currentUser: undefined,
    }


    // ----------------------------------------------------
    // Targeted Elements
    // ----------------------------------------------------

    const chatPage   = $(document)
    const chatWindow = $('.chatbubble')
    const chatHeader = chatWindow.find('.unexpanded')
    const chatBody   = chatWindow.find('.chat-window')


    // ----------------------------------------------------
    // Helpers
    // ----------------------------------------------------

    let helpers = {
        /**
         * Toggles the display of the chat window.
         */
        ToggleChatWindow: function () {
            chatWindow.toggleClass('opened')
            chatHeader.find('.title').text(
                chatWindow.hasClass('opened') ? 'Minimize Chat Window' : 'Chat with Support'
            )
        },

        /**
         * Show the appropriate display screen. Login screen
         * or Chat screen.
         */
        ShowAppropriateChatDisplay: function () {
            (chat.room && chat.room.id) ? helpers.ShowChatRoomDisplay() : helpers.ShowChatInitiationDisplay()
        },

        /**
         * Show the enter details form
         */
        ShowChatInitiationDisplay: function () {
            chatBody.find('.chats').removeClass('active')
            chatBody.find('.login-screen').addClass('active')
        },

        /**
         * Show the chat room messages dislay.
         */
        ShowChatRoomDisplay: function () {
            chatBody.find('.chats').addClass('active')
            chatBody.find('.login-screen').removeClass('active')

            const chatManager = new Chatkit.ChatManager({
                userId: chat.userId,
                instanceLocator: PUSHER_INSTANCE_LOCATOR,
                tokenProvider: new Chatkit.TokenProvider({userId: chat.userId, url: "/session/auth"})
            });

            chatManager.connect({
                onSuccess: currentUser => {
                    chat.currentUser = currentUser

                    currentUser.fetchMessagesFromRoom(chat.room, {}, messages => {
                        chatBody.find('.loader-wrapper').hide()
                        chatBody.find('.input, .messages').show()

                        messages.forEach(message => helpers.NewChatMessage(message))

                        currentUser.subscribeToRoom(chat.room, {
                            newMessage: message => helpers.NewChatMessage(message)
                        })
                    }, err => {
                        console.error(err)
                    })
                }
            });
        },

        /**
         * Append a message to the chat messages UI.
         */
        NewChatMessage: function (message) {
            if (chat.messages[message.id] === undefined) {
                const messageClass = message.sender.id !== chat.userId ? 'support' : 'user'

                chatBody.find('ul.messages').append(
                    `<li class="clearfix message ${messageClass}">
                        <div class="sender">${message.sender.name}</div>
                        <div class="message">${message.text}</div>
                    </li>`
                )

                chat.messages[message.id] = message

                chatBody.scrollTop(chatBody[0].scrollHeight)
            }
        },

        /**
         * Send a message to the chat channel
         */
        SendMessageToSupport: function (evt) {
            evt.preventDefault()

            const message = $('#newMessage').val().trim()

            chat.currentUser.sendMessage(
                {text: message, roomId: chat.room.id},
                msgId => { console.log("Message added!") },
                error => { console.log(`Error adding message to ${chat.room.id}: ${error}`) }
            )

            $('#newMessage').val('')
        },

        /**
         * Logs user into a chat session
         */
        LogIntoChatSession: function (evt) {
            const name  = $('#fullname').val().trim()
            const email = $('#email').val().trim().toLowerCase()

            // Disable the form
            chatBody.find('#loginScreenForm input, #loginScreenForm button').attr('disabled', true)

            if ((name !== '' && name.length >= 3) && (email !== '' && email.length >= 5)) {
                axios.post('/session/load', {name, email}).then(response => {
                    chat.userId = email
                    chat.room   = response.data
                    helpers.ShowAppropriateChatDisplay()
                })
            } else {
                alert('Enter a valid name and email.')
            }

            evt.preventDefault()
        }
    }


    // ----------------------------------------------------
    // Register page event listeners
    // ----------------------------------------------------

    chatPage.ready(helpers.ShowAppropriateChatDisplay)
    chatHeader.on('click', helpers.ToggleChatWindow)
    chatBody.find('#loginScreenForm').on('submit', helpers.LogIntoChatSession)
    chatBody.find('#messageSupport').on('submit', helpers.SendMessageToSupport)
}())
