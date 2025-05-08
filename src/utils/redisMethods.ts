import { SessionStore } from "@companieshouse/node-session-handler";

let sessionStore: SessionStore;

export const initialiseRedisClient = (store: SessionStore): void => {
    sessionStore = store;
};

export const setKey = async (key: string, value: string, ttlInSeconds?: number): Promise<void> => {
    if (!sessionStore) {
        throw new Error("SessionStore is not initialised");
    }
    if (ttlInSeconds) {
        await sessionStore.redis.setex(key, ttlInSeconds, value);
    } else {
        await sessionStore.redis.set(key, value);
    }
};

export const getKey = async (key: string): Promise<string | null> => {
    if (!sessionStore) {
        throw new Error("SessionStore is not initialised");
    }
    return sessionStore.redis.get(key);
};

export const deleteKey = async (key: string): Promise<void> => {
    if (!sessionStore) {
        throw new Error("SessionStore is not initialised");
    }
    await sessionStore.redis.del(key);
};