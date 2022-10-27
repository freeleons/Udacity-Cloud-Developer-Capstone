import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'
import {getUserId} from '../utils'
import {getGeneratedUploadURL} from "../../businessLogic/GroceryLists"
import {createLogger} from "../../utils/logger";

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const GroceryListId = event.pathParameters.GroceryListId
        const userId: string = getUserId(event)
        if (!GroceryListId) {
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'GroceryListId was not provided'})
            }
        }

        const signedUrl = await getGeneratedUploadURL(GroceryListId, userId)

        let logger = createLogger('generateUploadUrl');
        logger.info(`Generated signed url for a GroceryList`, {
            url: signedUrl,
            GroceryListId: GroceryListId
        })

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                uploadUrl: signedUrl
            })
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
