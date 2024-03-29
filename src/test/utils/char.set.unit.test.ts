import chai from "chai";
import { validateCharSet } from "../../utils/char-set";

const DUMMY_INVALID_NAME = "aaaa|";
const DUMMY_VALID_NAME = "bbbbbbbb";

describe("char.set.unit", () => {
    it("should return the invalid character if one is found", () => {
        const validatedCharSet = validateCharSet(DUMMY_INVALID_NAME);
        chai.expect(validatedCharSet).to.equal("|");
    });

    it("should return undefined if no invalid characters are found", () => {
        const validatedCharSet = validateCharSet(DUMMY_VALID_NAME);
        chai.expect(validatedCharSet).to.be.undefined;
    });

    it("should return undefined if the input is undefined", () => {
        const validatedCharSet = validateCharSet(undefined);
        chai.expect(validatedCharSet).to.be.undefined;
    });
});
