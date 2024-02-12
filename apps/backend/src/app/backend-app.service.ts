import { Injectable } from '@nestjs/common';

@Injectable()
export class BackendAppService {
    getData(): { message: string } {
        return { message: 'Hello API' };
    }
}
