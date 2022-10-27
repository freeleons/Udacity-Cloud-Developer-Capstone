import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { GroceryListItem } from '../models/GroceryListItem'
import { GroceryListUpdate } from '../models/GroceryListUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('GroceryListsAccess')

// GroceryList: Implement the dataLayer logic
export class GroceryListsAccess {

    constructor(
        private readonly docClient: DocumentClient = new DocumentClient(),
        private readonly GroceryListsTable = process.env.GroceryListS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}

    async getAllGroceryLists(userId: string): Promise<GroceryListItem[]> {
        logger.info('Getting all GroceryLists')
        const result = await this.docClient.query({
            TableName: this.GroceryListsTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const items = result.Items
        return items as GroceryListItem[]
    }

    async createGroceryList(GroceryListItem: GroceryListItem): Promise<GroceryListItem> {
        logger.info('Creating a new GroceryList')
        await this.docClient.put({
            TableName: this.GroceryListsTable,
            Item: GroceryListItem
        }).promise()
        return GroceryListItem
    }

    async updateGroceryList(GroceryListId: string, userId: string, GroceryListUpdate: GroceryListUpdate): Promise<GroceryListUpdate> {
        logger.info('Updating a GroceryList')
        await this.docClient.update({
            TableName: this.GroceryListsTable,
            Key: {
                GroceryListId,
                userId
            },
            UpdateExpression: 'set #name = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': GroceryListUpdate.name,
                ':d': GroceryListUpdate.dueDate,
                ':done': GroceryListUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise()
        return GroceryListUpdate
    }

    async deleteGroceryListItem(GroceryListId: string, userId: string): Promise<void> {
        logger.info('Deleting a GroceryList')
        await this.docClient.delete({
            TableName: this.GroceryListsTable,
            Key: {
                GroceryListId,
                userId
            }
        }).promise()
    }

    async persistAttachmentUrl(GroceryListId: string, userId: string, imageId: string): Promise<void> {
        logger.info('Persisting an attachment url')
        await this.docClient.update({
            TableName: this.GroceryListsTable,
            Key: {
                GroceryListId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :a',
            ExpressionAttributeValues: {
                ':a': `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
            }
        }).promise()
    }

    async generateUploadUrl(GroceryListId: string, userId: string): Promise<string> {
        logger.info('Generating an upload url')
        const s3 = new XAWS.S3({
            signatureVersion: 'v4'
        })
        const uploadUrl = s3.getSignedUrl("putObject", {
            Bucket: this.bucketName,
            Key: GroceryListId,
            Expires: parseInt(this.urlExpiration)
        });
        await this.docClient.update({
            TableName: this.GroceryListsTable,
            Key: { userId, GroceryListId },
            UpdateExpression: "set attachmentUrl=:URL",
            ExpressionAttributeValues: {
                ":URL": uploadUrl.split("?")[0]
            },
            ReturnValues: "UPDATED_NEW"
        })
            .promise();
        return uploadUrl;
    }


    async getGroceryListsForUser(userId: string): Promise<GroceryListItem[]> {
        logger.info('Getting all GroceryLists for user')
        const result = await this.docClient.query({
            TableName: this.GroceryListsTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const items = result.Items
        return items as GroceryListItem[]
    }


}
