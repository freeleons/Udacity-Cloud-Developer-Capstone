import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import {cors, httpErrorHandler} from 'middy/middlewares'
import {CreateGroceryListRequest} from '../../requests/CreateGroceryListRequest'
import {getUserId} from '../utils';
import * as uuid from 'uuid'
import {createGroceryList} from '../../businessLogic/GroceryLists'
import {createLogger} from "../../utils/logger";

const logger = createLogger('createGroceryList')
export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Processing event: ', event)
        logger.info('Create a new GroceryList')
        const createNewGroceryListRequest: CreateGroceryListRequest = JSON.parse(event.body)
        const GroceryListId = uuid.v4()
        const userId = getUserId(event)
        if (!createNewGroceryListRequest.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Must supply a name for the new todo.'
                })
            }
        }

        const newItem = await createGroceryList(createNewGroceryListRequest, userId, GroceryListId)
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                item: newItem
            })
        }
    })

handler.use(
    cors({
        credentials: true
    })
).use(httpErrorHandler())
