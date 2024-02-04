import { Module } from '@nestjs/common';
import { CollectWorkService } from './collect-work.service';
import { ProtocolModule } from '@aofg/protocol';
import { BackendProtocol } from '@aofg/backend-protocol';

@Module({
    imports: [ProtocolModule.forProtocols([BackendProtocol])],
    providers: [CollectWorkService],
})
export class CollectWorkModule {}
