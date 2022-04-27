import {
  Body,
  Controller,
  Param,
  Post, Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRedisInstanceOperation } from 'src/decorators/api-redis-instance-operation.decorator';
import {
  AddStreamEntriesDto, AddStreamEntriesResponse,
  CreateStreamDto,
  GetStreamEntriesDto,
  GetStreamEntriesResponse,
} from 'src/modules/browser/dto/stream.dto';
import { StreamService } from 'src/modules/browser/services/stream/stream.service';

@ApiTags('Streams')
@Controller('streams')
@UsePipes(new ValidationPipe({ transform: true }))
export class StreamController {
  constructor(private service: StreamService) {}

  @Post('')
  @ApiRedisInstanceOperation({
    description: 'Create stream',
    statusCode: 201,
  })
  async createStream(
    @Param('dbInstance') instanceId: string,
      @Body() dto: CreateStreamDto,
  ): Promise<void> {
    return this.service.createStream({ instanceId }, dto);
  }

  @Put('')
  @ApiRedisInstanceOperation({
    description: 'Add entries to the stream',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns entries IDs added',
        type: AddStreamEntriesResponse,
      },
    ],
  })
  async addEntries(
    @Param('dbInstance') instanceId: string,
      @Body() dto: AddStreamEntriesDto,
  ): Promise<AddStreamEntriesResponse> {
    return this.service.addEntries({ instanceId }, dto);
  }

  @Post('/get-entries')
  @ApiRedisInstanceOperation({
    description: 'Get stream entries',
    statusCode: 200,
    responses: [
      {
        status: 200,
        description: 'Returns ordered stream entries in defined range.',
        type: GetStreamEntriesResponse,
      },
    ],
  })
  async getEntries(
    @Param('dbInstance') instanceId: string,
      @Body() dto: GetStreamEntriesDto,
  ): Promise<GetStreamEntriesResponse> {
    return this.service.getEntries({ instanceId }, dto);
  }
}
