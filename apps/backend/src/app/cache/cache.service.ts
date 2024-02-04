import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
    store<T>(key: string, value: T): void {
        console.log('Cache store', key, value);
    }
}
