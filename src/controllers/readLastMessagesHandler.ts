import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getMessagesAround, getMessagesByCity } from "../services/messageService";
import { IMessage } from "../models/Message";

export const ReadLastMessagesHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'ReadLastMessages';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    if (!sessionAttributes['nickname']) {
      return handlerInput.responseBuilder
        .speak('Hold on, to communicate with your tribe, you first need to create an avatar. Go ahead and say: create my avatar')
        .reprompt('Go ahead and say: create my avatar')
        .getResponse();
    }

    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const numberOfMessages = slots['numberOfMessages'] && slots['numberOfMessages'].value ? slots['numberOfMessages'].value.toLowerCase() : undefined;

    const DEFAULT_RADIUS_IN_METERS = 5000;
    const lastMessages: IMessage[] = await getMessagesAround(sessionAttributes['longitude'], sessionAttributes['latitude'], DEFAULT_RADIUS_IN_METERS, numberOfMessages);

    const speechText = `Here are the last ${numberOfMessages || ''} messages sent by your ${sessionAttributes['city']} tribe's members: 
                      ${lastMessages.map((m, i) => `${m.nickname} said: ${m.message} ... ${i === (lastMessages.length - 1) ? `This was the last one` : `Here's another one: `}`)}`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};