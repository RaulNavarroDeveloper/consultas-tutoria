import {computed, onMounted, onUnmounted, ref} from "vue";
import {subscribeToAuthChanges} from "../services/auth.js";

export default function useAuth() {
    const user = ref({
        id: null,
        email: null,
        displayName: null,
    });

    const username = computed(() => {
        return user.value.displayName || user.value.email;
    });

    let unsubscribe;

    onMounted(() => {
        unsubscribe = subscribeToAuthChanges(newUserData => user.value = newUserData);
    });

    onUnmounted(() => {
        unsubscribe();
    });

    return {
        user,
        username,
    }
};
