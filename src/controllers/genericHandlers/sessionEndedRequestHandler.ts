import { HandlerInput } from "ask-sdk";

export const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput: HandlerInput) {
        const { requestEnvelope } = handlerInput;
        const request = requestEnvelope.request;
     
        // @ts-ignore
        console.log(`Session ended with reason:`);
        console.log(request);

        return handlerInput.responseBuilder.getResponse();
    },
  };