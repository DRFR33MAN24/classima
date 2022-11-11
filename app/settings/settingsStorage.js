// Expo Libraries
import * as SecureStore from "expo-secure-store";

const key = "appSettings";

const storeAppSettings = async (appSettings) => {
  try {
    await SecureStore.setItemAsync(key, appSettings);
  } catch (error) {
    // TODO add error storing
  }
};

const getAppSettings = async () => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    // TODO add error storing
  }
};

const removeAppSettings = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // TODO add error storing
  }
};

export default { storeAppSettings, getAppSettings, removeAppSettings };
