// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCSCMLx890HTHexGePAogxk8e94GBx5JG4",
//   authDomain: "quilix-7894b.firebaseapp.com",
//   projectId: "quilix-7894b",
//   storageBucket: "gs://quilix-7894b.firebasestorage.app", //"quilix-7894b.appspot.com",
//   messagingSenderId: "847852803942",
//   appId: "1:847852803942:web:8bd4b75976f413fe1e5aa7",
//   measurementId: "G-DG7Z5BFMNQ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const storage = getStorage(app);

// export { db, storage };



// firebase/config.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
} from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCSCMLx890HTHexGePAogxk8e94GBx5JG4",
  authDomain: "quilix-7894b.firebaseapp.com",
  projectId: "quilix-7894b",
  storageBucket: "gs://quilix-7894b.firebasestorage.app", //"quilix-7894b.appspot.com",
  messagingSenderId: "847852803942",
  appId: "1:847852803942:web:8bd4b75976f413fe1e5aa7",
  measurementId: "G-DG7Z5BFMNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// 👇 Connect to emulators when running locally
// if (window.location.hostname === "localhost") {
//   console.log("🔥 Connected to Firebase Local Emulators");
//   connectFirestoreEmulator(db, "localhost", 9745);
//   connectFunctionsEmulator(functions, "localhost", 5001);
//   connectStorageEmulator(storage, "localhost", 9199);
// }

export { db, storage, functions };
