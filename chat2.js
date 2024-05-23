// Function to retrieve the tenant ID from URL query parameters
function getChatRoomIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const chatRoomId = urlParams.get('chatRoomId');
    return chatRoomId;
}

function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get('tenantId');
    return tenantId;
}

function getSPIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const SPId = urlParams.get('userId');
    return SPId;
}

function getOwnerIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const OwnerId = urlParams.get('ownerId');
    return OwnerId;
}

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

// Get a reference to the Firebase database
const database = firebase.database();

async function initializeChat() {
    try {
        const chatRoomId = getChatRoomIdFromURL();
        if (chatRoomId) {
            const SPId = getSPIdFromURL();
            const OwnerId = getOwnerIdFromURL();
            fetchSPData(OwnerId,SPId);
            await fetchMessages(chatRoomId);
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, chatRoomId);
                    messageInput.value = '';
                }
            });

            // Add event listener for image upload
            document.getElementById('image-upload').addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    uploadImage(file, chatRoomId);
                }
            });
        } else {
            console.error("Chat Room ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

async function fetchMessages(chatRoomId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${chatRoomId}`);
        messagesRef.on('child_added', (snapshot) => {
            const messageData = snapshot.val();
            console.log("Message Data:", messageData); // Log message data
            displayMessage(messageData);
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}

function displayMessage(messageData) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    const { sender, message } = messageData;

    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'Tenant' ? 'sender' : 'receiver');

    if (message.startsWith && message.startsWith('http')) {
        const imageUrl = message;
        console.log("Image URL:", imageUrl); // Log image URL
        if (imageUrl) {
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.classList.add('chat-image'); // Add a class for styling
            messageElement.appendChild(imageElement);
        } else {
            console.error("Image URL is undefined.");
        }
    } else {
        messageElement.innerText = `${sender}: ${message}`;
    }
    chatMessagesElement.appendChild(messageElement);
}

async function sendMessage(message, chatRoomId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${chatRoomId}`);
        await messagesRef.push({
            sender: 'Tenant',
            message: message
        });
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

async function uploadImage(file, chatRoomId) {
    try {
        const storageRef = firebase.storage().ref();
        const imageName = Date.now() + '-' + file.name;
        const imageRef = storageRef.child(imageName);
        await imageRef.put(file);
        const imageUrl = await imageRef.getDownloadURL();
        sendMessage(imageUrl, chatRoomId); // Send image URL as message
        return imageUrl; // Return image URL
    } catch (error) {
        console.error("Error occurred while uploading image:", error);
        return null; // Return null in case of error
    }
}

document.getElementById('close-chat').addEventListener('click', () => {
    const tenantId = getTenantIdFromURL();
    window.location.href = `tenant-dashboard.html?uid=${tenantId}`;
});

function displaySPName(SPUsername) {
    const SPNameElement = document.getElementById('service-provider-name');
    if (SPNameElement) {
        SPNameElement.innerText = `Chatting with: ${SPUsername}`;
    } else {
        console.error("Element with ID 'service-provider-name' not found.");
    }
}

function fetchSPData(ownerId, SPId) {
    console.log("Owner ID: ",ownerId);
    console.log("SP ID: ",SPId);
    const SPDataRef = firebase.database().ref('ownerCreatedIDs/' + ownerId+'/'+SPId);
    SPDataRef.once('value', (snapshot) => {
        const SPData = snapshot.val();
        if (SPData) {
            const SPUsername = SPData.username; // Extract owner's username
            displaySPName(SPUsername);
        } else {
            console.error('Service Provider data not found in the database.');
        }
    });
}

initializeChat();
