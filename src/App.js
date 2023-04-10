import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyAk0SMxS4--fn7IA60ZccDK2tYpbdPzfx8",
  authDomain: "chat-app-49327.firebaseapp.com",
  projectId: "chat-app-49327",
  storageBucket: "chat-app-49327.appspot.com",
  messagingSenderId: "357360921205",
  appId: "1:357360921205:web:56a43c8f06ca49d5a4663c",
  measurementId: "G-LYVDZ4TH0T",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, "messages"), orderBy("timestamp"));

    // Listen to real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    });

    // Sign in anonymously if not already signed in
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.log("Error signing in anonymously:", error);
      });
    }

    return () => unsubscribe();
  }, [auth, app]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (text.trim() !== "") {
        const db = getFirestore(app);
        const currentUser = auth.currentUser;
        if (currentUser) {
          addDoc(collection(db, "messages"), {
            text,
            userId: currentUser.uid,
            timestamp: Date.now(),
          });
        }
        setText("");
      }
    }
  };

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.userId}: {message.text}
          </li>
        ))}
      </ul>
      <input
        type='text'
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default App;
