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

// Function to retrieve the tenant ID from URL query parameters
function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenantId');
}

// Function to retrieve the service provider ID from URL query parameters
function getServiceProviderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('serviceProviderId');
}

async function getOwnerIdFromDatabase(SPID) {
    try {
        const snapshot = await database.ref('ownerCreatedIDs').once('value');
        let ownerId = null;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            if (ownerData.hasOwnProperty(SPID)) {
                const SPData = ownerData[SPID];
                ownerId = SPData.ownerid;
                console.log(SPID);
                console.log(ownerId);
            }
        });
        return ownerId;
    } catch (error) {
        console.error("Error occurred while retrieving owner ID:", error);
        return null;
    }
}

// Function to initialize the chat
async function initializeChat() {
    try {
        const tenantId = getTenantIdFromURL();
        console.log('tenant id:',tenantId);
        const serviceProviderId = getServiceProviderIdFromURL();
        if (tenantId && serviceProviderId) {
            const OwnerId = await getOwnerIdFromDatabase(serviceProviderId);
            console.log('OWNER ID IS ',OwnerId);
            console.log('TENANT ID IS ',tenantId);
            console.log('SERVICE PROVIDER ID IS ',serviceProviderId);
            fetchTenantData(OwnerId,tenantId);
            await fetchMessages(serviceProviderId, tenantId);
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, serviceProviderId, tenantId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Service Provider ID or Tenant ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to fetch messages
async function fetchMessages(serviceProviderId, tenantId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${serviceProviderId}_${tenantId}`);
        messagesRef.on('child_added', (snapshot) => {
            const messageData = snapshot.val();
            if (messageData && messageData.sender && messageData.message) {
                displayMessage(messageData.sender, messageData.message);
            }
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}

// Function to display tenant name
function displayTenantName(TenantUsername) {
    const TenantNameElement = document.getElementById('tenant-name');
    if (TenantNameElement) {
        TenantNameElement.innerText = `Chatting with: ${TenantUsername}`;
    } else {
        console.error("Element with ID 'tenant-name' not found.");
    }
}

function fetchTenantData(OwnerId, tenantId) {
    console.log("Owner ID: ",OwnerId);
    console.log("Tenant ID: ",tenantId);
    const TenantDataRef = firebase.database().ref('ownerCreatedIDs/' + OwnerId+'/'+tenantId);
    TenantDataRef.once('value', (snapshot) => {
        const TenantData = snapshot.val();
        if (TenantData) {
            const TenantUsername = TenantData.username; // Extract owner's username
            displayTenantName(TenantUsername);
        } else {
            console.error('Tenant data not found in the database.');
        }
    });
}

// Function to display message
function displayMessage(sender, message) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'Service Provider' ? 'sender' : 'receiver');
    
    if (message.startsWith('http')) {
        const imageElement = document.createElement('img');
        imageElement.src = message;
        imageElement.classList.add('chat-image');
        messageElement.appendChild(imageElement);
    } else {
        messageElement.innerText = message;
    }
    
    chatMessagesElement.appendChild(messageElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// Function to send a message
async function sendMessage(message, serviceProviderId, tenantId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${serviceProviderId}_${tenantId}`);
        await messagesRef.push({
            sender: 'Service Provider',
            message: message
        });
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

// Close chat button event listener
document.getElementById('close-chat').addEventListener('click', () => {
    const tenantId = getTenantIdFromURL();
    window.location.href = `service-provider-dashboard.html?tenantId=${tenantId}`;
});

// Initialize the chat
initializeChat();


/*const firebaseConfig = {
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

async function initializeChat() {
    try {
        const tenantId = getTenantIdFromURL();
        const serviceProviderId = getServiceProviderIdFromURL();
        if (tenantId && serviceProviderId) {
            await fetchMessages(serviceProviderId, tenantId);
            displayTenantName(tenantId);
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, serviceProviderId, tenantId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Service Provider ID or Tenant ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to retrieve the tenant ID from URL query parameters
function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenantId');
}

// Function to retrieve the service provider ID from URL query parameters
function getServiceProviderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('serviceProviderId');
}

// Function to initialize the chat
async function initializeChat() {
    try {
        const tenantId = getTenantIdFromURL();
        const serviceProviderId = getServiceProviderIdFromURL();
        if (tenantId && serviceProviderId) {
            await fetchMessages(serviceProviderId, tenantId);
            displayTenantName(tenantId);
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, serviceProviderId, tenantId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Service Provider ID or Tenant ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Inside the fetchMessages function, when processing the messages:
async function fetchMessages(serviceProviderId, tenantId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${serviceProviderId}_${tenantId}`);
        messagesRef.on('child_added', (snapshot) => {
            const messageData = snapshot.val();
            if (messageData && messageData.sender && messageData.message) {
                if (messageData.message.startsWith && messageData.message.startsWith('Service Provider:')) {
                    const imageUrl = messageData.message.split(' ')[2]; // Assuming the image URL is at the third position
                    displayImage(imageUrl);
                } else {
                    displayMessage(`${messageData.sender}: ${messageData.message}`);
                }
            }
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}




// Function to display tenant name
function displayTenantName(tenantId) {
    const tenantNameElement = document.getElementById('tenant-name');
    tenantNameElement.innerText = `Chatting with Tenant: ${tenantId}`;
}

// Function to display message
function displayMessage(message) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    if (message.startsWith && message.startsWith('Tenant: http')) {
        const imageUrl = message.split(' ')[1]; // Extract the image URL from the message
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.classList.add('chat-image'); // Add a class for styling
        messageElement.appendChild(imageElement);
    } else {
        messageElement.innerText = message;
    }
    chatMessagesElement.appendChild(messageElement);
}



// Function to send a message
async function sendMessage(message, serviceProviderId, tenantId) {
    try {
        const messagesRef = database.ref(`service_provider_tenant_messages/${serviceProviderId}_${tenantId}`);
        await messagesRef.push({
            sender: 'Service Provider',
            message: message
        });
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

// Close chat button event listener
document.getElementById('close-chat').addEventListener('click', () => {
    const tenantId = getTenantIdFromURL();
    window.location.href = `service-provider-dashboard.html?tenantId=${tenantId}`;
});

// Initialize the chat
initializeChat();*/