import { DefaultConfirmationTemplateFactory } from "../../controllers/ConfirmationTemplateFactory";
import { ConfirmationTemplateMapper } from "../../controllers/ConfirmationTemplateMapper";
import { expect } from "chai";

describe("DefaultConfirmationTemplateFactory", () => {
    describe("getMapper", () => {
        it("Return mapper for disenrolled users if user is disenrolled", () => {
            // given
            const disenrolledMapper = {} as ConfirmationTemplateMapper;
            const enrolledMapper = {} as ConfirmationTemplateMapper;
            const factory = new DefaultConfirmationTemplateFactory(disenrolledMapper, enrolledMapper);

            // when
            const actual = factory.getMapper({ enrolled: false });

            // then
            expect(actual).equals(disenrolledMapper);
        });

        it("Return mapper for enrolled users if user is enrolled", () => {
            // given
            const disenrolledMapper = {} as ConfirmationTemplateMapper;
            const enrolledMapper = {} as ConfirmationTemplateMapper;
            const factory = new DefaultConfirmationTemplateFactory(disenrolledMapper, enrolledMapper);

            // when
            const actual = factory.getMapper({ enrolled: true });

            // then
            expect(actual).equals(enrolledMapper);
        });

    });
});
