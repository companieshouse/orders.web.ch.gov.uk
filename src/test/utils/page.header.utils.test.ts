import chai from "chai";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { mapPageHeader } from "../../utils/page.header.utils";
import { PageHeader } from "../../model/PageHeader";

const deliveryDetailsPath = "/delivery-details";
const basketPath = "/basket";
const confirmationPath =
    "/orders/ORD-811516-715265/confirmation?ref=orderable_item_ORD-811516-715265&state=9e307591-45c8-4dcd-b06d-2bf5e7d6c9d0&status=paid";
const testEmailAddress: string = "test@testemail.com";

// @SuppressWarnings("typescript:S2699")
describe("mapPageHeader", () => {
    it("should populate the header correctly for the delivery details page", async () => {
        testPageHeader(deliveryDetailsPath);
    });

    it("should populate the header correctly for the basket page", async () => {
        testPageHeader(basketPath);
    });

    it("should populate the header correctly for the confirmation page", async () => {
        testPageHeader(confirmationPath);
    });
});

const testPageHeader = (path: string) => {
    const mockRequest = generateMockRequest(path, 1);

    const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
    chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
    chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
};

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
