<script setup>
    import {onMounted, ref} from 'vue';
    import {getUsuariosDatos, getArrayUsuariosId, getMensajesHaciaAlguien} from "../services/private-chats.js";
    import useAuth from "../composition/useAuth.js";


    const usuarios = ref(null);
    const {user} = useAuth();
    onMounted(() => {
        // getMensajesHaciaAlguien(user.value.id)
       
        // getArrayUsuariosId(user.value.id)
        // .then(result => {
        //     usuarios.value = result;
        //     console.log('usuariosId => ', result)
        // })
        getUsuariosDatos(user.value.id)
        .then(async function(result) {
            usuarios.value = await result;
            console.log('usuariosDatos => ', result)
        })
    });
    </script>

    <template>
        <div>
            <h1>Hola</h1>
            <div v-for="user in usuarios">
                <p>{{user.correo}}</p>
            </div>
        </div>
    </template>
    