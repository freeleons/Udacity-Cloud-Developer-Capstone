import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'

import {deleteGroceryList} from '../../businessLogic/GroceryLists'
import {getUserId} from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const GroceryListId = event.pathParameters.GroceryListId
        const userId = getUserId(event)
        await deleteGroceryList(GroceryListId, userId)

        return {
            statusCode: 204,
            body: JSON.stringify(true)
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
