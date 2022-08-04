import { ConfirmationTemplateMapper } from "./ConfirmationTemplateMapper";

export type Enrollable = { enrolled: boolean };

export interface ConfirmationTemplateFactory {
    getMapper(basket: Enrollable): ConfirmationTemplateMapper;
}

export class DefaultConfirmationTemplateFactory implements ConfirmationTemplateFactory {

    private disenrolledTemplateMapper: ConfirmationTemplateMapper;
    private enrolledTemplateMapper: ConfirmationTemplateMapper;

    constructor (disenrolledTemplateMapper: ConfirmationTemplateMapper, enrolledTemplateMapper: ConfirmationTemplateMapper) {
        this.disenrolledTemplateMapper = disenrolledTemplateMapper;
        this.enrolledTemplateMapper = enrolledTemplateMapper;
    }

    getMapper(basket: Enrollable): ConfirmationTemplateMapper {
        if (basket.enrolled) {
            return this.enrolledTemplateMapper;
        } else {
            return this.disenrolledTemplateMapper;
        }
    }
}
