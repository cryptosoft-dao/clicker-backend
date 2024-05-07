import { ConfigurationService } from '@aofg/configuration';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { createHmac } from "crypto";

function parseInitData(initData: any) {
    const q = new URLSearchParams(initData);
    const hash = q.get("hash");
    q.delete("hash");
    const v = Array.from(q.entries());
    v.sort(([aN], [bN]) => aN.localeCompare(bN));
    const data_check_string = v.map(([n, v]) => `${n}=${v}`).join("\n");
    return { hash, data_check_string };
}

function parseAndValidate(bot_token: string, initData: any) {
    const { hash, data_check_string } = parseInitData(initData);

    const secret_key = createHmac("sha256", "WebAppData").update(bot_token).digest();
    const key = createHmac("sha256", secret_key)
        .update(data_check_string)
        .digest("hex");

    if (key === hash) {
        const obj = Object.fromEntries(new URLSearchParams(initData).entries()) as Record<string, unknown>
        obj.user = JSON.parse(obj.user as string)
        obj.time = Math.floor(new Date().getTime() / 1000)
        obj.start_param = obj.start_param || "238211251";
        (obj.user as any).id = (obj.user as any).id.toString()
        return obj
    }

    throw new Error("Unvalidated")
}


// export const code = async (inputs) => {
//     const initData = parseAndValidate(inputs.token, inputs.body)
//     return {
//         initData,
//         invite: {
//             refereeId: initData.start_param,
//             referralId: (initData.user as any).id.toString(),
//             referralMeta: initData.user,
//             password: "4c88c6411d57a987f4b9103d2faa98b26282f10681587bc963793097dfb75383"
//         },
//         meta: initData.user
//     }
// };


@Controller()
@ApiTags('Game')
export class GameController {
    constructor(private readonly config: ConfigurationService) {}

    @Post('signup')
    async signup(@Body() body: { raw: string }) {
        console.log(body, this.config.telegramBotName, this.config.telegramBotToken)
        const initData = parseAndValidate(this.config.telegramBotToken, body.raw)

        console.log(initData);
        throw new Error('not implemented')
    }
}
