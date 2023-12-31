import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';

const ChatScreen = () => {
    const socket = useSocket();

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]); // Changed from 'message' to 'messages'

    const handleSend = () => {
        socket.emit('send:message', { message: input, socketId: socket.id });
        setInput(''); // Clear input after sending message
    };

    useEffect(() => {
        // Use a function to update state based on previous state
        socket.on('send:message', ({ message, email }) => {
            console.log(message, email);
            const newMessage = {
                message: message,
                email: email,
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        // Clean up the socket listener when the component unmounts
        return () => {
            socket.off('send:message'); // Remove the specific listener
        };
    }, [socket]);

    return (
        <div style={styles.container}>
            <div style={styles.messageContainer}>
                {messages &&
                    messages.map((item, index) => (
                        <div key={index} style={styles.message}>
                            <span style={styles.sender}>{item.email}:</span> {item.message}
                        </div>
                    ))}
            </div>
            <div style={styles.inputContainer}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
                <button onClick={handleSend}>Send to me</button>
            </div>
        </div>
    );
};


const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    messageContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        border: '1px solid #ccc',
    },
    message: {
        marginBottom: '10px',
    },
    sender: {
        fontWeight: 'bold',
        marginRight: '5px',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
    },
};
export default ChatScreen;
