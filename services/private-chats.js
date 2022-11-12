import {
    getFirestore,
    doc,
    getDocs,
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    limit, orderBy, onSnapshot,
} from "firebase/firestore";


const db = getFirestore();

async function getPrivateChatRef({from, to}) {
    // Para guardar el mensaje, necesitamos obtener la referencia del chat privado que corresponde a estos
    // dos usuarios.
    let privateChatRef;

    // Buscamos la sala actual a ver si existe. Para lograrlo, buscamos el documento de chat privado que
    // contenga a los dos usuarios.
    // Armamos el query, y buscamos los documentos que cumplan con esto.
    // ¿Por qué documento*s*? Lamentablemente, no podemos buscar un documento por un query.
    const queryChat = query(collection(db, 'private-chats'), where('users', '==', {
        [from]: true,
        [to]: true,
    }), limit(1));

    const docsSnap = await getDocs(queryChat);

    // Preguntamos si no existe el documento.
    if(docsSnap.empty) {
        // Si la sala no existe, entonces tenemos que crearla.
        privateChatRef = await addDoc(collection(db, 'private-chats'), {
            users: {
                [from]: true,
                [to]: true,
            }
        });
    } else {
        privateChatRef = docsSnap.docs[0];
    }

    return privateChatRef;
}





export async function sendPrivateMessage({from, to, text}) {
    const privateChatRef = await getPrivateChatRef({from, to});

    // Grabamos el mensaje.
    return addDoc(collection(db, 'private-chats', privateChatRef.id, 'messages'), {
        from,
        text,
        created_at: serverTimestamp(),
    });
}




export async function subscribeToPrivateChat({from, to}, callback) {
    const privateChatRef = await getPrivateChatRef({from, to});

    const queryChat = query(
        collection(db, 'private-chats', privateChatRef.id, 'messages'),
        orderBy('created_at'),
    );

    return onSnapshot(queryChat, snapshot => {
        const messages = snapshot.docs.map(item => {
            return {
                text: item.data().text,
                from: item.data().from,
                created_at: item.data().created_at?.toDate(),
            };
        });

        callback(messages);
    });
}



// export async function obtenerMensajesHaciaAlguien () {
//     const queryChat = query(collection(db, 'private-chats'), where('users', '==', {
//         [to]: 'vvR3TFt6TngbViEoStqOp7flI793',
//     }))
//     const docsSnap = await getDocs(queryChat);
//     return docsSnap.docs;
// }

// export async function getMensajesHaciaAlguien(id) {
//     console.log("MESNAJES")
//     const q = query(collection(db, 'private-chats'), where(`users.${id}`, '==', true));
//     const docs = await getDocs(q);
    
//     console.log("MESNAJES: ", docs.docs.map(item => item.data().users));
//     const busqueda = docs.docs.map(item => item.data().user);
//     // console.log(busqueda);
    
//     const q2 = query(collection(db, 'usuarios'), where('id', 'in', busqueda))
//     const docs2 = await getDocs(q2);
//     console.log("MESNAJES: ", docs2.docs);
// }




// export async function obtenerMensajesHaciaAlguien(id) {
//     const q = query(collection(db, 'private-chats'), where(`users.${id}`, '==', true));
//     const docs = await getDocs(q);
//     let array = docs.docs.map(item => item.data());
//     console.log("array => ", array)

//     let arrayUsuarios = [];
//     for(let a of array) {
//         for(let b of Object.keys(a.users)) {
//             if(b !== id) {
//                 arrayUsuarios.push(b);
//             }
//         }
//     }


//     const q2 = query(collection(db, 'usuarios'), where("id", "in", arrayUsuarios))
//     const docs2 = await getDocs(q2);
//     console.log("USUARIOS", docs2.docs.map(item => item.data()));

//     onSnapshot(q2, (snapshot) => {
//         let users = [];
//         snapshot.docs.forEach((doc) => {
//             users.push({...doc.data()})
//         })
//         console.log('USER SNAPSHOT ->', users)
//     })

// }


export async function getMensajesHaciaAlguien(id) {
    // console.log("MESNAJES")
    const q = query(collection(db, 'private-chats'), where(`users.${id}`, '==', true));
    const docs = await getDocs(q);
    return docs.docs.map(item => item.data()); 
}



export async function getArrayUsuariosId(id) {
    // let array = docs.docs.map(item => item.data());
    let arrayUsuarios = [];
    for(let a of await getMensajesHaciaAlguien(id)) {
        for(let b of Object.keys(a.users)) {
            if(b !== id) {
                arrayUsuarios.push(b);
            }
        }
    }
    // console.log('ARRAY USUARIOS ->', arrayUsuarios);
    return arrayUsuarios;
}




export async function getUsuariosDatos(id) {
    const q2 = query(collection(db, 'usuarios'), where("id", "in", await getArrayUsuariosId(id)))
    const docs2 = await getDocs(q2);
    // console.log("USUARIOS", docs2.docs.map(item => item.data()));
    let users = [];
    onSnapshot(q2, (snapshot) => {
        // let users = [];
        snapshot.docs.forEach((doc) => {
            users.push({...doc.data()})
        })
        // console.log('USER SNAPSHOT ->', users);
    })
    return users;
}