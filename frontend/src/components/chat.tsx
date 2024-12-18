import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { jwtDecode } from "jwt-decode";
import { Local } from "../environment/env";
import { io, Socket } from "socket.io-client";
import moment from "moment"; // Import Moment.js
import "./Chat.css";

// Create socket instance here
let socket: Socket;

const fetchChatRooms = async (token: string) => {
  const response = await api.get(`${Local.BASE_URL}chat/chatRooms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const fetchChatMessages = async (chatRoomId: string, token: string) => {
  try {
    const response = await api.get(
      `${Local.BASE_URL}chat/chatMessages/${chatRoomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const sendChatMessage = async (messageData: any, token: string) => {
  const response = await api.post(
    `${Local.BASE_URL}chat/sendMessage`,
    messageData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("message>>>>>>>>>>>>>.............", response);
  return response.data;
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const token: any = localStorage.getItem("token");
  const decoded: any = jwtDecode(token);
  const userId = decoded.uuid;
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  const {
    data: chatRooms,
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => fetchChatRooms(token!),
  });

  const { mutate: sendMessage } = useMutation({
    mutationFn: (messageData: any) => sendChatMessage(messageData, token!),
    onSuccess: () => {
      setMessage("");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }

    // Initialize socket connection
    socket = io(`${Local.BASE_URL}`);

    socket.on("receive_message", (messageData) => {
      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, messageData];
        return updatedMessages.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [token, navigate]);

  useEffect(() => {
    if (selectedRoom && !isJoined) {
      socket.emit("join_room", selectedRoom);
      setIsJoined(true);
    }

    return () => {
      if (selectedRoom) {
        socket.emit("leave_room", selectedRoom);
      }
    };
  }, [selectedRoom]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setChatMessages([]);
    fetchChatMessages(roomId, token!).then((messages) => {
      const sortedMessages = messages.sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setChatMessages(sortedMessages);
    });

    // Find the selected room to get the patient name
    const selectedRoomData = chatRooms?.find(
      (room: any) => room.roomId === roomId
    );
    if (selectedRoomData) {
      setPatientName(selectedRoomData.patientName); // Set patient name
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const timestamp = new Date().toISOString();  // Get the current timestamp in ISO format

    const messageData = {
      chatRoomId: selectedRoom,
      senderId: userId,
      message,
      timestamp,  // Add timestamp to the message data
    };

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { senderId: userId, message, firstname: "You", timestamp },  // Add timestamp to the local message state
    ]);

    socket.emit("send_message", messageData);

    sendMessage(messageData);
  };

  // Function to format the timestamp into a human-readable format with "Today", "Tomorrow" labels
  const formatDate = (timestamp: string) => {
    const date = moment(timestamp).utcOffset("+05:30"); // Set to IST (Indian Standard Time)

    // Get the current date and time
    const today = moment().startOf('day');
    const tomorrow = moment(today).add(1, 'days');

    // Check if the message is from today or tomorrow
    if (date.isSame(today, 'day')) {
      return `Today at ${date.format("hh:mm A")}`;
    } else if (date.isSame(tomorrow, 'day')) {
      return `Tomorrow at ${date.format("hh:mm A")}`;
    } else {
      return date.format("MMM D, YYYY, hh:mm A"); // Default format for other dates
    }
  };

  return (
    <div className="chat-container row">
      {/* Left Panel - Chat Rooms List */}
      <div
        className="chat-header col"
        style={{ marginLeft: "20%", width: "50%" }}
      >
        <h5>Messages</h5>
        <input
          type="text"
          className="form-control my-3"
          placeholder="Search..."
        />
        <ul className="list-group">
          {roomsLoading ? (
            <div>Loading rooms...</div>
          ) : roomsError ? (
            <div>
              Error loading rooms:{" "}
              {roomsError instanceof Error
                ? roomsError.message
                : "Unknown error"}
            </div>
          ) : (
            chatRooms?.map((room: any) => (
              <li
                key={room.roomId}
                className="list-group-item"
                onClick={() => handleSelectRoom(room.roomId)}
              >
                <span className="fw-bold">{room.patientName}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Right Panel - Chat Window */}
      <div className="chat-messages col">
        {selectedRoom ? (
          <>
            <div className="chat-header">
              {patientName ? (
                <h6>Chat with: {patientName}</h6>
              ) : (
                <h6>Select a room to start chatting</h6>
              )}
            </div>
            <div className="messages-container">
              {chatMessages.map((msg: any, index) => (
                <div
                  key={index}
                  className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                >
                  <strong
                    style={{
                      color: msg.senderId === userId ? "black" : "green",  // Set color based on sender
                      maxWidth: msg.senderId !== userId ? '75%' : 'none', // Set 75% width for receiver's name
                    }}
                  >
                    {msg.senderId === userId ? "You" : `${msg.senderFirstName} ${msg.senderLastName}`} :
                  </strong>
                  <span
                    style={{
                      maxWidth: msg.senderId === userId ? '75%' : '75%',  // Set 75% width for received messages only
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.message}
                  </span>
                  <div className="message-time">
                    <small>{formatDate(msg.timestamp)}</small>  {/* Display formatted timestamp */}
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <textarea
                className="form-control"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    // Check if Enter key is pressed without Shift (to prevent newline)
                    e.preventDefault(); // Prevent the default behavior of Enter (creating a new line)
                    handleSendMessage(); // Trigger message send
                  }
                }}
              />

              <button
                className="btn btn-primary my-2"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div>Select a chat room to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
