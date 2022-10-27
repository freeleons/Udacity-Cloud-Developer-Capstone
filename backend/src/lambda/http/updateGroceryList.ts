import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'

import {updateGroceryList} from '../../businessLogic/GroceryLists'
import {UpdateGroceryListRequest} from '../../requests/UpdateGroceryListRequest'
import {getUserId} from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const GroceryListId = event.pathParameters.GroceryListId
        const updatedGroceryList: UpdateGroceryListRequest = JSON.parse(event.body)
        const userId = getUserId(event)
        await updateGroceryList(GroceryListId, userId, updatedGroceryList)

        return {
            statusCode: 204,
            body: JSON.stringify(true)
        }
    })

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
