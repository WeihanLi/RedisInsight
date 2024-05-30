import {
  describe,
  deps,
  Joi,
  getMainCheckFn,
  serverConfig,
} from '../../deps';
import {nock} from "../../../helpers/test";
import {mockAiChatId} from "src/__mocks__";

const { server, request } = deps;

// endpoint to test
const endpoint = () => request(server).post('/ai/assistant/chats');

const responseSchema = Joi.object().keys({
  id: Joi.string().required(),
}).required().strict(true);

const mainCheckFn = getMainCheckFn(endpoint);

const aiAssistantNock = nock(serverConfig.get('ai').convAiApiUrl)
  .post('/auth')
  .reply(200, { convai_session_id: mockAiChatId })

describe('POST /ai/assistant/chats', () => {
  [
    {
      name: 'Should return new chat id',
      responseSchema,
      responseBody: {
        id: mockAiChatId,
      },
    },
    {
      name: 'Should return Unauthorized error',
      before: () => {
        aiAssistantNock.post('/auth').reply(401, { message: 'Unauthorized' })
      },
      statusCode: 401,
      responseBody: {
        statusCode: 401,
        error: 'ConvAiUnauthorized',
        message: 'Authorization failed',
        errorCode: 11301,
      },
    },
  ].map(mainCheckFn);
});
