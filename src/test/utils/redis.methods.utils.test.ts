import { SessionStore } from "@companieshouse/node-session-handler/lib/session/store/SessionStore";
import { expect } from "chai";
import sinon from "sinon";


import { initialiseRedisClient, setKey, getKey, deleteKey } from "../../utils/redisMethods";

describe("Redis Utils", () => {
    let sandbox: sinon.SinonSandbox;
    let mockRedis: any;
    let mockSessionStore: SessionStore;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockRedis = {
            set: sandbox.stub().resolves(),
            setex: sandbox.stub().resolves(),
            get: sandbox.stub().resolves("mock-value"),
            del: sandbox.stub().resolves()
        };

        mockSessionStore = { redis: mockRedis } as unknown as SessionStore;

        initialiseRedisClient(mockSessionStore);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("setKey", () => {
        it("should set a key with TTL", async () => {
            await setKey("test-key", "test-value", 60);
            sinon.assert.calledWith(mockRedis.setex, "test-key", 60, "test-value");
        });

        it("should set a key without TTL", async () => {
            await setKey("test-key", "test-value");
            sinon.assert.calledWith(mockRedis.set, "test-key", "test-value");
        });

        it("should throw error if sessionStore is not initialised", async () => {
            initialiseRedisClient(null as any); 

            await expect(setKey("a", "b")).to.be.rejectedWith("SessionStore is not initialised");
        });
    });

    describe("getKey", () => {
        it("should return the value for a key", async () => {
            const result = await getKey("test-key");
            expect(result).to.equal("mock-value");
            sinon.assert.calledWith(mockRedis.get, "test-key");
        });

        it("should throw error if sessionStore not initialised", async () => {
            initialiseRedisClient(null as any); 
            await expect(getKey("a")).to.be.rejectedWith("SessionStore is not initialised");
        });
    });

    describe("deleteKey", () => {
        it("should delete a key", async () => {
            await deleteKey("test-key");
            sinon.assert.calledWith(mockRedis.del, "test-key");
        });

        it("should throw error if sessionStore isnt initialised", async () => {
            initialiseRedisClient(null as any); 
            await expect(deleteKey("a")).to.be.rejectedWith("SessionStore is not initialised");
        });
    });
});
