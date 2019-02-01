import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getMessagesAround, getMessagesByCity } from "../services/messageService";
import { getUserProfile, getUserProfilesAround, getUserProfilesByCity } from "../services/userProfileService";
import { getUserInfos, isGeolocationSupported, askForGeoPermissionResponse } from "../utils/alexaUtils";
import { IMessage } from "../models/Message";

export const ReadLastMessagesHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'ReadLastMessages';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    // @ts-ignore request.intent issue
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const numberOfMessages = slots['numberOfMessages'] && slots['numberOfMessages'].value ? slots['numberOfMessages'].value.toLowerCase() : undefined;

    const userInfos = getUserInfos(handlerInput);
    const DEFAULT_RADIUS = 5;
    const lastMessages: IMessage[] = await getMessagesAround(userInfos.coordinate.longitudeInDegrees, userInfos.coordinate.latitudeInDegrees, DEFAULT_RADIUS, numberOfMessages);

    const speechText = `Here are the last ${numberOfMessages || ''} messages: ${lastMessages.forEach((m, i) => `${m.nickname} said: ${m.message} ... ${i === (lastMessages.length - 1) ? `This was the last one` : `Here's another one: `}`)}`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};