import { Test, TestingModule } from '@nestjs/testing';
import { CollectWorkService } from './collect-work.service';

describe('CollectWorkService', () => {
    let service: CollectWorkService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CollectWorkService],
        }).compile();

        service = module.get<CollectWorkService>(CollectWorkService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
