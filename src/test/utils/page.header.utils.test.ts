// import sinon from "sinon";
// import { signedInSessionData, SIGNED_IN_COOKIE } from "../__mocks__/redis.mocks";
import chai from "chai";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { mapPageHeader } from "../../utils/page.header.utils";
import { PageHeader } from "../../model/PageHeader";

const deliveryDetailsPath = "/delivery-details";
const basketPath = "/basket";
// TODO GCI-2426 Check this
const confirmationPath = "/confirmation";
const testEmailAddress: string = "test@testemail.com";

describe("mapPageHeader", () => {
    it("should populate the header correctly for the delivery details page", async () => {
        const mockRequest = generateMockRequest(deliveryDetailsPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("should populate the header correctly for the basket page", async () => {
        const mockRequest = generateMockRequest(basketPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("should populate the header correctly for the confirmation page", async () => {
        const mockRequest = generateMockRequest(confirmationPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });
});

const generateMockRequest = (path: string, isSignedIn: number):Request => {
    const mockRequest = {
        path: path
    } as Request;
    mockRequest.session = new Session(
        {
            signin_info: {
                user_profile: {
                    email: testEmailAddress
                },
                signed_in: isSignedIn
            }
        }
    );
    return mockRequest;
};
