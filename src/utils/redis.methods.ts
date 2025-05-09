import { SessionStore } from "@companieshouse/node-session-handler";

let sessionStore: SessionStore;


// Methods created to allow paymentReference from createPayment to be stored in Redis
// and retrieved in the order confirmation page
export const initialiseRedisClient = (store: SessionStore): void => {
    sessionStore = store;
};

// Set a key in Redis with an optional TTL
// If TTL is provided, use setex otherwise use set
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

// Get a key from Redis
export const getKey = async (key: string): Promise<string | null> => {
    if (!sessionStore) {
        throw new Error("SessionStore is not initialised");
    }
    return sessionStore.redis.get(key);
};

// Delete a key from Redis to cleaning up expired keys or when the session is destroyed
export const deleteKey = async (key: string): Promise<void> => {
    if (!sessionStore) {
        throw new Error("SessionStore is not initialised");
    }
    await sessionStore.redis.del(key);
};