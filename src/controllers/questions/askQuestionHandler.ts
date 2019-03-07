import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services } from 'ask-sdk-model';
import { insertQuestion } from "../../services/questionService";
import { IQuestion } from "../../models/Question";
import { isIntentAndState } from "../../utils/alexaUtils";
import STATES from "../STATES";

export const AskQuestionHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    if (isIntentAndState(handlerInput, 'AskQuestion')) {
      return true;
    } else if (isIntentAndState(handlerInput, 'AMAZON.YesIntent', STATES.QUESTIONS.ASK_QUESTION_YES_NO)) {
      return true;
    } else {
      return false;
    }
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
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const questionString = slots['question'] && slots['question'].value ? slots['question'].value.toLowerCase() : undefined;

    if (!questionString) {
      return handlerInput.responseBuilder
              .addDelegateDirective(
              {
                  name: 'AskQuestion',
                  confirmationStatus: 'NONE',
                  slots: {
                      // @ts-ignore
                      question: {
                          name: 'question',
                          confirmationStatus: 'NONE'
                      }
                  }
              })
              .speak(`Oh, you already have a question, let's start then`)
              .getResponse();
  }

    const question: IQuestion | any = { question: questionString, 
                                      userId: sessionAttributes['userId'], 
                                      nickname: sessionAttributes['nickname'], 
                                      assignedPollyVoice: sessionAttributes['assignedPollyVoice'], 
                                      locationPoint: {
                                        type: 'Point', 
                                        coordinates: [sessionAttributes['longitude'], sessionAttributes['latitude']]
                                    },
                                    locationDetails: {
                                        city: sessionAttributes['city'],
                                        country: sessionAttributes['countryCode'],
                                        cityPolygon: null
                                    }                           
                                    };
    await insertQuestion(question);

    sessionAttributes['state'] = STATES.QUESTIONS.GET_QUESTIONS_YES_NO;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    const repromptMessage = `While waiting for answers, do you want to help your tribe meanwhile ?`
    const speechText = `
    <speak>
        <p> Your question has been broadcasted to your tribe ! </p>
        <p> ${repromptMessage} </p>
    </speak>
    `;

    return handlerInput.responseBuilder    
      .speak(speechText)
      .reprompt(repromptMessage)
      .withShouldEndSession(false)
      .getResponse();
  },
};

export const NoAskQuestionHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    if (isIntentAndState(handlerInput, 'AMAZON.NoIntent', STATES.QUESTIONS.ASK_QUESTION_YES_NO)) {
      return true;
    } else {
      return false;
    }
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes['state'] = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    return handlerInput.responseBuilder    
      .speak('Ok, whenever you want. When you will be ready, just say: Ask question. Bye !')
      .getResponse();
  },
};