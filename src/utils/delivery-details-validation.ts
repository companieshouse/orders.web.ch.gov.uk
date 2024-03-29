import { check } from "express-validator";
import * as errorMessages from "../model/error.messages";
import { validateCharSet } from "../utils/char-set";
import { createGovUkErrorData, GovUkErrorData } from "../model/govuk.error.data";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const COMPANY_NAME_FIELD: string = "companyName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";

export const deliveryDetailsValidationRules =
    [
        check(FIRST_NAME_FIELD)
            .not().isEmpty().withMessage(errorMessages.ORDERS_DETAILS_FIRST_NAME_EMPTY)
            .isLength({ max: 32 }).withMessage(errorMessages.ORDER_DETAILS_FIRST_NAME_MAX_LENGTH)
            .custom((_firstName, { req }) => {
                const invalidChar = validateCharSet(req.body[FIRST_NAME_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.FIRST_NAME_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(LAST_NAME_FIELD)
            .not().isEmpty().withMessage(errorMessages.ORDERS_DETAILS_LAST_NAME_EMPTY)
            .isLength({ max: 32 }).withMessage(errorMessages.ORDER_DETAILS_LAST_NAME_MAX_LENGTH)
            .custom((_lastName, { req }) => {
                const invalidChar = validateCharSet(req.body[LAST_NAME_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.LAST_NAME_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(COMPANY_NAME_FIELD)
            .isLength({ max: 32 }).withMessage(errorMessages.ORDER_DETAILS_COMPANY_NAME_NAME_MAX_LENGTH)
            .custom((_companyName, { req }) => {
                const invalidChar = validateCharSet(req.body[COMPANY_NAME_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.COMPANY_NAME_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(ADDRESS_LINE_ONE_FIELD)
            .not().isEmpty().withMessage(errorMessages.ADDRESS_LINE_ONE_EMPTY)
            .isLength({ max: 50 }).withMessage(errorMessages.ADDRESS_LINE_ONE_MAX_LENGTH)
            .custom((_addressLineOne, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_LINE_ONE_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_LINE_ONE_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(ADDRESS_LINE_TWO_FIELD)
            .isLength({ max: 50 }).withMessage(errorMessages.ADDRESS_LINE_TWO_MAX_LENGTH)
            .custom((_addressLineTwo, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_LINE_TWO_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_LINE_TWO_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(ADDRESS_TOWN_FIELD)
            .not().isEmpty().withMessage(errorMessages.ADDRESS_TOWN_EMPTY)
            .isLength({ max: 50 }).withMessage(errorMessages.ADDRESS_TOWN_MAX_LENGTH)
            .custom((_addressTown, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_TOWN_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_TOWN_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),

        check(ADDRESS_COUNTY_FIELD)
            .custom((addressCounty, { req }) => {
                const addressPostcodeValue = req.body[ADDRESS_POSTCODE_FIELD];
                if (!addressPostcodeValue && !addressCounty) {
                    throw Error(errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY);
                }
                return true;
            }),
        check(ADDRESS_COUNTY_FIELD)
            .isLength({ max: 50 }).withMessage(errorMessages.ADDRESS_COUNTY_MAX_LENGTH)
            .custom((_addressCounty, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_COUNTY_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_COUNTY_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(ADDRESS_POSTCODE_FIELD)
            .isLength({ max: 15 }).withMessage(errorMessages.ADDRESS_POSTCODE_MAX_LENGTH)
            .custom((_addressPostcode, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_POSTCODE_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_POSTCODE_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            }),
        check(ADDRESS_COUNTRY_FIELD)
            .not().isEmpty().withMessage(errorMessages.ADDRESS_COUNTRY_EMPTY)
            .isLength({ max: 50 }).withMessage(errorMessages.ADDRESS_COUNTRY_MAX_LENGTH)
            .custom((_addressCountry, { req }) => {
                const invalidChar = validateCharSet(req.body[ADDRESS_COUNTRY_FIELD]);
                if (invalidChar) {
                    throw Error(errorMessages.ADDRESS_COUNTRY_INVALID_CHARACTERS + invalidChar);
                }
                return true;
            })
    ];

export const validate = (validationErrors) => {
    let addressCountyError;
    let addressCountryError;
    let addressLineOneError;
    let addressLineTwoError;
    let addressPostcodeError;
    let addressTownError;
    let firstNameError;
    let lastNameError;
    let companyNameError;

    const validationErrorList = validationErrors.array({ onlyFirstError: true }).map((error) => {
        const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");
        switch (error.param) {
        case FIRST_NAME_FIELD:
            firstNameError = govUkErrorData;
            break;
        case LAST_NAME_FIELD:
            lastNameError = govUkErrorData;
            break;
        case COMPANY_NAME_FIELD:
            companyNameError = govUkErrorData;
            break;
        case ADDRESS_LINE_ONE_FIELD:
            addressLineOneError = govUkErrorData;
            break;
        case ADDRESS_LINE_TWO_FIELD:
            addressLineTwoError = govUkErrorData;
            break;
        case ADDRESS_TOWN_FIELD:
            addressTownError = govUkErrorData;
            break;
        case ADDRESS_COUNTY_FIELD:
            addressCountyError = govUkErrorData;
            break;
        case ADDRESS_POSTCODE_FIELD:
            addressPostcodeError = govUkErrorData;
            break;
        case ADDRESS_COUNTRY_FIELD:
            addressCountryError = govUkErrorData;
            break;
        }
        if (error.msg === errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY) {
            addressCountyError = createGovUkErrorData(errorMessages.ADDRESS_COUNTY_EMPTY, "#" + error.param, true, "");
            addressPostcodeError = createGovUkErrorData(
                errorMessages.ADDRESS_POSTCODE_EMPTY, "#" + error.param, true, "");
        }
        return govUkErrorData;
    });
    return {
        errorList: validationErrorList,
        addressCountyError,
        addressCountryError,
        addressLineOneError,
        addressLineTwoError,
        addressPostcodeError,
        addressTownError,
        firstNameError,
        lastNameError,
        companyNameError
    };
};
