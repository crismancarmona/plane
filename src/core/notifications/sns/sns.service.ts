import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { PlaneDto } from '@crisman999/plane-types/src/domain/plane';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SnsService {
  private readonly logger = new Logger(SnsService.name);
  private readonly snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({
      endpoint: 'http://localstack:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
      },
    });
  }

  async sendStatus(plane: PlaneDto): Promise<void> {
    this.logger.log('sending message');
    const command = new PublishCommand({
      Message: JSON.stringify(plane),
      TopicArn: 'arn:aws:sns:us-east-1:000000000000:plane-status-topic',
    });

    try {
      const result = await this.snsClient.send(command);
      this.logger.log(`Message published successfully: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(
        'Error publishing message 2',
        error,
        JSON.stringify(error),
      );
    }
  }
}
