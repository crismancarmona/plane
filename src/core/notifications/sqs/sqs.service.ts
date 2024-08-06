import {
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  Message,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PlaneFactory } from 'src/plane/plane.factory';
import { PlaneService } from 'src/plane/plane.service';

@Injectable()
export class SqsService implements OnApplicationBootstrap {
  private sqsClient;
  private readonly logger = new Logger(SqsService.name);

  constructor(
    private readonly planeService: PlaneService,
    private readonly planeFactory: PlaneFactory,
  ) {
    this.sqsClient = new SQSClient({
      endpoint: 'http://localstack:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'foo',
        secretAccessKey: 'bar',
      },
    });
  }

  onApplicationBootstrap() {
    /* 
    setInterval(async () => {
      const plane = this.planeFactory.getCurrentPlane();
      if (plane) {
        const messages = (await this.receiveMessage()) ?? [];
        if (messages.length > 0) {
          const filteredMessages = messages.filter((message) => {
            const action: ProcessActionDto = JSON.parse(message.Body ?? '{}');
            return action.planeId === plane.id;
          });
          for await (const message of filteredMessages) {
            this.logger.log('action', message);
            const processAction: ProcessActionDto = JSON.parse(message.Body!);

            await this.planeService.executeAction(
              processAction.action,
              plane,
              processAction.params,
            );

            await this.deleteMessage(message);
          }
        }
      }
    }, 250);
    */
  }

  private async receiveMessage(): Promise<Message[] | undefined> {
    try {
      const receiveMessageInput: ReceiveMessageCommandInput = {
        QueueUrl:
          'https://localhost.localstack.cloud:4566/000000000000/plane-actions-queue',
      };
      const commandResponse = await this.sqsClient.send(
        new ReceiveMessageCommand(receiveMessageInput),
      );

      return commandResponse.Messages;
    } catch (error) {
      this.logger.warn(error);
    }
  }

  async deleteMessage(message: Message) {
    const deleteMessageInput: DeleteMessageCommandInput = {
      QueueUrl:
        'https://localhost.localstack.cloud:4566/000000000000/plane-actions-queue',
      ReceiptHandle: message.ReceiptHandle,
    };

    await this.sqsClient.send(new DeleteMessageCommand(deleteMessageInput));
  }
}
