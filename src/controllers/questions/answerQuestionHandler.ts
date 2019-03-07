import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services, Intent } from 'ask-sdk-model';
import { insertAnswer } from '../../services/answerService';
import { IAnswer } from "../../models/Answer";
import { isIntentAndState } from "../../utils/alexaUtils";
import STATES from "../STATES";

export const AnswerQuestionHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
        if (isIntentAndState(handlerInput, 'AnswerLastQuestion')) {
            return true;
        } else if (isIntentAndState(handlerInput, 'AMAZON.YesIntent', STATES.QUESTIONS.ANSWER_YES_NO)) {
            return true;
        } else {
            return false;
        }
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['state'] = STATES.ANSWERING_QUESTION;

        const lastQuestionId: String = sessionAttributes['lastQuestionId'];
        if (!lastQuestionId) {
            return handlerInput.responseBuilder.speak(`You need to hear a question first`).getResponse();
        }
        // @ts-ignore request.intent issue
        const slots = handlerInput.requestEnvelope.request.intent.slots || {};
        const answerString = slots['answerMessage'] && slots['answerMessage'].value ? slots['answerMessage'].value.toLowerCase() : undefined;

        if (!answerString) {
            return handlerInput.responseBuilder
                    .addDelegateDirective(
                    {
                        name: 'AnswerLastQuestion',
                        confirmationStatus: 'NONE',
                        slots: {
                            // @ts-ignore
                            answerMessage: {
                                name: 'answerMessage',
                                confirmationStatus: 'NONE'
                            }
                        }
                    })
                    .getResponse();
        }

        const answer: IAnswer | any = { 
            questionId: lastQuestionId,
            answer: answerString, 
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

        await insertAnswer(answer);

        sessionAttributes['previousIntent'] = 'AnswerQuestion';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
                .speak(`Thanks for helping your tribe ${sessionAttributes['nickname']}`)
                .getResponse();
    },
};


export const YesNoAnswerQuestionHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
      if (isIntentAndState(handlerInput, 'AMAZON.NoIntent', STATES.QUESTIONS.ANSWER_YES_NO)) {
          return true;
      } else {
          return false;
      }
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {
  
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        if (isIntentAndState(handlerInput, 'AMAZON.NoIntent')) {
        
            sessionAttributes['previousIntent'] = 'NoAnswerQuestion';
            let response;
            if (sessionAttributes['wasLastQuestion']) {
                response = handlerInput.responseBuilder
                    .speak(`Oh ok, we won't answer this question. There's no other questions`)
                    .getResponse();
        } else {
            sessionAttributes['state'] = STATES.QUESTIONS.NEXT_QUESTION_YES_NO;
            response = handlerInput.responseBuilder
                .speak(`Oh ok, we won't answer this question. Do you want to hear another one ?`)
                .reprompt(`Do you want to hear another question ?`)
                .withShouldEndSession(false)
                .getResponse();
        }

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return response;
      }
    },
};