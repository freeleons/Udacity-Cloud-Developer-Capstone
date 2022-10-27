import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'

import {getGroceryListsForUser} from '../../businessLogic/GroceryLists'
import {getUserId} from '../utils';

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // Write your code here
        const userId = getUserId(event)
        const GroceryLists = await getGroceryListsForUser(userId)
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({items: GroceryLists})
        }
    })

handler.use(
    cors({
        credentials: true
    })
)
