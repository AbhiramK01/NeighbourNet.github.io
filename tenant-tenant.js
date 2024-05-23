const firebaseConfig = {
    apiKey: "AIzaSyChjJ9pR88NhwtE5PEgOtwv6SH1K-hs8b0",
    authDomain: "neighbournet-60ef7.firebaseapp.com",
    databaseURL: "https://neighbournet-60ef7-default-rtdb.firebaseio.com",
    projectId: "neighbournet-60ef7",
    storageBucket: "neighbournet-60ef7.appspot.com",
    messagingSenderId: "996168822739",
    appId: "1:996168822739:web:245c41a1a677d192b64926",
    measurementId: "G-QL3MHMHKHL"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenantId');
}

function getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

function generateChatRoomId(tenantId, userId) {
    const ids = [tenantId, userId].sort();
    return `${ids[0]}_${ids[1]}`;
}

async function fetchUsername(userId) {
    try {
        const ownerCreatedIdsRef = database.ref('ownerCreatedIDs');
        const snapshot = await ownerCreatedIdsRef.once('value');
        const ownerData = snapshot.val();

        console.log("Owner Data:", ownerData);

        for (const ownerId in ownerData) {
            if (ownerData.hasOwnProperty(ownerId)) {
                const userData = ownerData[ownerId];
                console.log("User Data:", userData);
                for (const id in userData) {
                    if (userData.hasOwnProperty(id) && userData[id].userid === userId) {
                        return userData[id].username;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
    return 'Unknown User';
}

async function displayTenantName(tenantId) {
    const TenantUsername = await fetchUsername(tenantId)
    const TenantNameElement = document.getElementById('tenant-name');
    if (TenantNameElement) {
        TenantNameElement.innerText = `Chatting with: ${TenantUsername}`;
    } else {
        console.error("Element with ID 'tenant-name' not found.");
    }
}

async function initializeChat() {
    try {
        const tenantId = getTenantIdFromURL();
        const userId = getUserIdFromURL();
        const chatRoomId = generateChatRoomId(tenantId, userId);

        if (chatRoomId) {
            displayTenantName(userId);
            await fetchMessages(chatRoomId, tenantId);
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, chatRoomId, tenantId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Chat Room ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

async function fetchMessages(chatRoomId, currentUserId) {
    try {
        const messagesRef = database.ref(`tenant_tenant_messages/${chatRoomId}`);
        messagesRef.on('child_added', async (snapshot) => {
            const messageData = snapshot.val();
            console.log("Message Data:", messageData);
            const senderName = await fetchUsername(messageData.senderId);
            console.log("Sender Name:", senderName);
            displayMessage(senderName, messageData.message, messageData.senderId === currentUserId);
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}

function displayMessage(senderName, message, isSender) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSender ? 'sender' : 'receiver'}`;
    messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
    chatMessagesElement.appendChild(messageElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight; // Scroll to the bottom
}

async function sendMessage(message, chatRoomId, senderId) {
    try {
        const messagesRef = database.ref(`tenant_tenant_messages/${chatRoomId}`);
        await messagesRef.push({
            senderId: senderId,
            message: message
        });
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('close-chat').addEventListener('click', () => {
        const tenantId = getTenantIdFromURL();
        window.location.href = `tenant-dashboard.html?uid=${tenantId}`;
    });

    initializeChat();
});
