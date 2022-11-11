// Expo Libraries
import * as SecureStore from "expo-secure-store";

const key = "authUser";

const storeUser = async (authUser) => {
  try {
    await SecureStore.setItemAsync(key, authUser);
  } catch (error) {
    // TODO add error storing
  }
};

const getUser = async () => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    // TODO add error storing
  }
};

const removeUser = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // TODO add error storing
  }
};

export default { storeUser, getUser, removeUser };
