import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { getUserInfos } from "../utils/alexaUtils";

export const LaunchRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    const userInfos = getUserInfos(handlerInput);

    const speechText = 'Welcome to the Tribe ! You can broadcast messages to nearby people in your tribe and listen to';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome to the Tribe !', speechText)
      .getResponse();
  },
};


// PROGRESSIVE RESPONSE API
import SendDirectiveRequest = services.directive.SendDirectiveRequest;

function callDirectiveService(handlerInput : HandlerInput, date : string) : Promise<void> {
  const requestEnvelope = handlerInput.requestEnvelope;
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

  const requestId = requestEnvelope.request.requestId;

  const directive : SendDirectiveRequest = {
      header: {
          requestId,
      },
      directive: {
          type: 'VoicePlayer.Speak',
          speech: `$Please wait while I look up information about ${date}...`,
      },
  };

  return directiveServiceClient.enqueue(directive);
}