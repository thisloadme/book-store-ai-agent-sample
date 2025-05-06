class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            clearButton: document.querySelector('.chatbox__clear'),
        }

        this.state = true;
        this.messages = [];
    }

    onEnterButton(chatbox) {
        if (event.key === 'Enter') {
            this.onSendButton(chatbox)
        }
    }

    display() {
        const {openButton, chatBox, sendButton, clearButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        clearButton.addEventListener('click', () => this.onClearButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener('keyup', ({key}) => {
            console.log(key);
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state

        if (this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input')
        let text1 = textField.value
        if (text1 === '') {
            return
        }

        let msg1 = {name: 'User', message: text1}
        this.messages.push(msg1)

        fetch($SCRIPT_ROOT + '/chat', {
            method: 'POST',
            body: JSON.stringify({message: text1}),
            mode: 'cors',
            headers: {'Content-Type': 'application/json'}
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: 'Sam', message: r.response }
            this.messages.push(msg2)
            this.updateChatText(chatbox)
            textField.value = ''
        }).catch(err => {
            console.error('Error: ', err)
            this.updateChatText(chatbox)
            textField.value = ''
        });
    }

    onClearButton(chatbox) {
        this.messages = [];
        this.updateChatText(chatbox);

        fetch($SCRIPT_ROOT + '/clear', {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        })
    }

    updateChatText(chatbox) {
        var html = ''
        this.messages.slice().reverse().forEach(function (item) {
            if (item.name === 'Sam') {
                var message = item.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                message = message.replace(/\n/g, '<br>')
                html += '<div class="messages__item messages__item--visitor">' + message + '</div>'
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        })

        const chatMessage = chatbox.querySelector('.chatbox__messages')
        chatMessage.innerHTML = html
    }
}

const chatbox = new Chatbox()
chatbox.display()