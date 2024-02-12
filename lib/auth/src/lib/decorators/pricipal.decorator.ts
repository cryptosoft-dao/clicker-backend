import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { PricipalDto } from "../auth.dto";

export const Pricipal = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as PricipalDto;
});