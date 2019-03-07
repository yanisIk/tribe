import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';

export const GetUserProfile : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'GetUserProfile';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (!sessionAttributes['nickname']) {
      return handlerInput.responseBuilder
        .speak(`You didn't create your avatar yet. To do that, say: Create my avatar`)
        .reprompt(`To create your avatar, say: Create my avatar`)
        .getResponse();
    }

    const speechText = 
    `<speak>
        
        <p>
            Your nickname is <emphasis level="moderate">${sessionAttributes['nickname']}</emphasis> and <voice name="${sessionAttributes['assignedPollyVoice']}">this is how your voice will sound like</voice>.
            Your tribe is located in ${sessionAttributes['city']}
        </p>

        <p> If you want to edit your profile, say: Change my avatar </p>
        
    </speak>`;

    const response = handlerInput.responseBuilder.getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
}
};