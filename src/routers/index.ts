import {Router, Response, NextFunction, Request} from "express";

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
};

const router: Router = Router();

router.get("/orders", renderTemplate("order-complete"));
router.get("/basket**", renderTemplate("blank"));

export default router;
