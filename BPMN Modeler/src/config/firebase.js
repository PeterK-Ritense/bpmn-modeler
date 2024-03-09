import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, set, child, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBzHcdAT90LxaEVO8w-kovb8RRAIVx2jYs",
    authDomain: "bpmn-modeler-44ddb.firebaseapp.com",
    databaseURL: "https://bpmn-modeler-44ddb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bpmn-modeler-44ddb",
    storageBucket: "bpmn-modeler-44ddb.appspot.com",
    messagingSenderId: "844904112613",
    appId: "1:844904112613:web:b4d1fbf1bbe3422f33cf0c",
    measurementId: "G-JZDN2RW0Y6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth, GoogleAuthProvider, signInWithPopup };

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Get reference to the database
        const db = getDatabase();
        const userRef = ref(db, 'users/' + user.uid);

        // Check if the user already exists in the database
        get(child(userRef, '/')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log('User already exists in the database.');
                // Update last login or other relevant fields
                set(userRef, {
                    ...snapshot.val(),
                    email: user.email,
                    displayName: user.displayName,
                    lastLogin: new Date().toISOString()
                });
            } else {
                console.log('New user added to the database.');
                // Add new user data
                set(userRef, {
                    email: user.email,
                    displayName: user.displayName,
                    createdAt: new Date().toISOString()
                });
            }
        }).catch((error) => {
            console.error(error);
        });

    } catch (error) {
        console.error('Error during Google sign-in: ', error);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out: ', error);
    }
};

// Function to save a BPMN model
export const saveBPMNModel = (model) => {
    const db = getDatabase();
    set(ref(db, `bpmnModels/${model.id}`), {
        name: model.name,
        ownerId: model.ownerId,
        projectId: model.projectId,
        xmlData: model.xmlData,
        updatedAt: new Date().toISOString()
    }).then(() => {
        console.log('BPMN model saved successfully.');
    }).catch((error) => {
        console.error('Error saving BPMN model: ', error);
    });
};

// Function to retrieve a BPMN model
export const getBPMNModel = async (modelId) => {
    const db = getDatabase();
    const modelRef = ref(db, `bpmnModels/${modelId}`);

    try {
        const snapshot = await get(child(modelRef, '/'));
        if (snapshot.exists()) {
            console.log('BPMN model data: ', snapshot.val());
            return snapshot.val().xmlData; // or return the entire snapshot.val() if you need more data
        } else {
            console.log('No BPMN model found.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving BPMN model: ', error);
        return null;
    }
};