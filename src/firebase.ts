import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Use provided database ID or default
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Analytics if supported
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}

testConnection();
