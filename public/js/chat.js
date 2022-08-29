// const socket = io({
//     auth: {
//         token: 1234
//     }
// })

const chatNameSpace = io("/chat")

const messageInput = document.getElementById("messageInput"),
    chatForm = document.getElementById("chatForm"),
    chatBox = document.getElementById("chat-box"),
    feedback = document.getElementById("feedback"),
    onlineUsers = document.getElementById("online-users-list"),
    chatContainer = document.getElementById("chatContainer"),
    pvChatForm = document.getElementById("pvChatForm"),
    pvMessageInput = document.getElementById("pvMessageInput"),
    modalTitle = document.getElementById("modalTitle"),
    pvChatMessage = document.getElementById("pvChatMessage");


const nickname = localStorage.getItem("nickname"),
    chatroom = localStorage.getItem("chatroom");

let socketId;

// Event Emits

chatNameSpace.emit('login', { nickname, chatroom })

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (messageInput.value) {
        chatNameSpace.emit("chat message", {
            message: messageInput.value,
            chatroom
        })
        messageInput.value = ""
    }
})



messageInput.addEventListener("keypress", (event) => {
    chatNameSpace.emit("typing", {
        name: nickname,
        chatroom
    })
})

pvChatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (pvMessageInput.value) {
        chatNameSpace.emit("pvChat", {
            name: nickname,
            message: pvMessageInput.value,
            to: socketId,
            from: chatNameSpace.id
        })
    }

    $("#pvChat").modal("hide");
    pvMessageInput.value = ""
})

// Event Listening

chatNameSpace.on("pvChat", (data) => {
    $("#pvChat").modal("show")
    socketId = data.from;
    modalTitle.innerHTML = `${data.name} پیام شخصی از طرف `;
    pvChatMessage.style.display = "block";
    pvChatMessage.innerHTML = data.name + " : " + data.message;
})

chatNameSpace.on("onlineUsers", (users) => {
    onlineUsers.innerHTML = ""

    for (const socketId in users) {
        if (users[socketId].chatroom === chatroom) {
            onlineUsers.innerHTML += `
            <li >
            <button type="button" class="btn btn-light mx-2 p-2" data-toggle="modal" data-target="#pvChat" data-id=${socketId} data-client=${
                users[socketId].nickname
            }                    ${users[socketId].nickname === nickname ? "disabled" : ""}>
                    ${users[socketId].nickname}
                    <span class="badge badge-success"> </span>
                </button>
            </li>
        `;
        }
    }
})


chatNameSpace.on("chat message", (data) => {
    feedback.innerHTML = ""
    chatBox.innerHTML += `
            <li class="alert alert-light">
                <span
                    class="text-dark font-weight-normal"
                    style="font-size: 13pt"
                    >${nickname}</span
                >
                <span
                    class="
                        text-muted
                        font-italic font-weight-light
                        m-2
                    "
                    style="font-size: 9pt"
                    >ساعت 12:00</span
                >
                <p
                    class="alert alert-info mt-2"
                    style="font-family: persian01"
                >
                ${data.message}
                </p>
            </li>`;
})


chatNameSpace.on("typing", (data) => {
    feedback.innerHTML = `<p class='alert alert-warning w-25'><em>${data.name} در حال نوشتن است....</em></p>`
})

$("#pvChat").on("show.bs.modal", function(e) {
    var button = $(e.relatedTarget);
    var user = button.data("client");
    socketId = button.data("id");

    modalTitle.innerHTML = `ارسال پیام شخصی به ${user}`
    pvChatMessage.style.display = "none"
})