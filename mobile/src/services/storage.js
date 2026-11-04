import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@academia_jiujitsu_pro:';

export const storage = {
  async get(key, defaultValue = null) {
    try {
      const item = await AsyncStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  },

  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(k => k.startsWith(STORAGE_PREFIX));
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};
