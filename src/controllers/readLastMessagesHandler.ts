import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';

export const ReadLastMessagesHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'BroadcastMessage';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const message = slots['message'] && slots['message'].value ? slots['message'].value.toLowerCase() : undefined;

    const speechText = 'Welcome to the Tribe ! You can broadcast messages to nearby people in your tribe and listen to';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome to the Tribe !', speechText)
      .getResponse();
  },
};