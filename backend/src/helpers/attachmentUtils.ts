import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('todo-business')
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)


// TODO: Implement the fileStogare logic
const s3BucketName = process.env.S3_BUCKET_NAME
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils{
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'V4'}),
        private readonly bucketName = s3BucketName,
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE
        
    ) {}

    getAttachmentUrl(todoId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }

    getUploadUrl(todoId: string) {
        logger.info('Entering Business Logic function');
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: urlExpiration
        })
        return url as string
    }

    async deleteTodoAttachment(attachmentUrl: string){
        const arr = attachmentUrl.split("/")
        const attachmentKey = arr[arr.length - 1]
        return await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: attachmentKey,
        }).promise()
    }

    async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string){
        return await this.docClient.update({
            TableName: this.todoTable,
            Key: {
              userId,
              todoId
            },
            UpdateExpression: "set attachmentUrl=:attachmentUrl",
            ExpressionAttributeValues:{
                ":attachmentUrl": attachmentUrl,
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()
    }
}