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

    const speechText = `Your nickname is ${sessionAttributes['nickname']} and you chose to have a ${sessionAttributes['voiceGender']} voice.
                        Your tribe is located in ${sessionAttributes['city']}`;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
}
};