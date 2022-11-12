import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, collection, setDoc, getDoc} from "firebase/firestore";

import app from "./firebase";
const firestore = getFirestore(app)

const auth = getAuth();


// export const AUTH_ERROR_MESSAGES = {
//     'auth/invalid-email': 'El email ingresado no existe en nuestro registros.',
//     'auth/internal-error': 'Los datos ingresados no parecen correctos. Por favor, revisá que estén los valores para el email y el password.',
//     'auth/wrong-password': 'El password es incorrecto.',
// }

let userData = {
    id: null,
    email: null,
    displayName: null,
    // rol: null,
    // photoURL: null,
};


if(localStorage.getItem('user') !== null) {
    userData = JSON.parse(localStorage.getItem('user'));
}

export async function getRol(uid) {
    const docuRef = doc(firestore, `usuarios/${uid}`);
    const docuCifrada = await getDoc(docuRef);
    const infoFinal = docuCifrada.data().rol;
    return infoFinal
}



// Verificamos el estado de autenticación contra Firebase.
onAuthStateChanged(auth, user => {
    // user va a tener una instancia de User, si el usuario está autenticado, o null si no lo está.
    // https://firebase.google.com/docs/reference/js/firebase.User
    if(user) {
        userData = {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
        };
        getRol(user.uid)
    } else {
        userData = {
            id: null,
            email: null,
            displayName: null,
        };
    }
    
    // setUserWithFirebaseAndRol(user);
    // Guardamos en localStorage los cambios.
    localStorage.setItem('user', JSON.stringify(userData));
    // Notificamos a todos los interesados.
    notifyAll();
});

/*
 |--------------------------------------------------------------------------
 | Login/logout
 |--------------------------------------------------------------------------
 */
/**
 * Registra un usuario.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export async function register({email, password, rol= "usuario", id}) {
    const firestore = getFirestore(app);
    const usuarioInfo = await createUserWithEmailAndPassword(auth, email, password)
        .then((usuarioBase => {
            return usuarioBase
        }));
        console.log(usuarioInfo);
        const docuRef = doc(firestore, `usuarios/${usuarioInfo.user.uid}`);
        setDoc(docuRef, { correo: email, rol: rol, id: usuarioInfo.user.uid});
    }

/**
 * Inicia sesión.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export function login({ email, password }) {
    return signInWithEmailAndPassword(auth, email, password)
        .then(user => {
            if(user) {
                console.log("El usuario está autenticado.");
            } else {
                console.log("El usuario _no_ está autenticado.");
            }
        })
        .catch(error => {
            console.log("[auth.login] error: ", error.code, error.message);
        });
}

/**
 * Cierra la sesión.
 *
 * @returns {Promise<void>}
 */
export function logout() {
    return signOut(auth)
        .then(() => {
            console.log('Cerraste Sesión');
        });
}

/**
 * Actualiza el perfil del usuario.
 *
 * @param {string} displayName
 * @returns {Promise<void>}
 */
export function updateUserProfile({displayName}) {
    return updateProfile(auth.currentUser, {
        displayName,
    })
        .then(() => {
            // Actualizamos la data actual del usuario a la nueva.
            userData = {
                ...userData,
                displayName,
            };

            // Notificamos los cambios en la data del usuario.
            notifyAll();
        });
}

let observers = [];


export function subscribeToAuthChanges(callback) {
    // Agregamos el callback a la lista de observers.
    observers.push(callback);

    console.log("Observer agregado con éxito. ", observers);

    // Cada vez que se agrega un callback, lo ejecutamos inmediatamente para
    // notificar el estado actual.
    notify(callback);

    return () => {
        // Eliminamos el observer agregado, filtrando la lista de observers.
        observers = observers.filter(observerCallback => observerCallback !== callback);
    }
}


function notify(callback) {
    callback({...userData});
}

function notifyAll() {
    observers.forEach(callback => notify(callback));
}