import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response } from 'ask-sdk-model';
import { getQuestionsAround } from "../../services/questionService";
import { IQuestion } from "../../models/Question";
import { isIntentAndState } from "../../utils/alexaUtils";
import STATES from "../STATES";

export const GetQuestionsHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    if (isIntentAndState(handlerInput, 'GetQuestions')) {
      return true;
    } else if (isIntentAndState(handlerInput, 'AMAZON.NextIntent', STATES.LISTENING_TO_QUESTIONS)) {
      return true;
    } else if (isIntentAndState(handlerInput, 'Skip', STATES.LISTENING_TO_QUESTIONS)) {
      return true;
    } else if (isIntentAndState(handlerInput, 'AMAZON.YesIntent', STATES.QUESTIONS.NEXT_QUESTION_YES_NO)) {
      return true;
    // Hybrid mode (using next + using yes dialog)
    } else if (isIntentAndState(handlerInput, 'AMAZON.NextIntent', STATES.QUESTIONS.ANSWER_YES_NO)) {
        return true;
    } else if (isIntentAndState(handlerInput, 'Skip', STATES.QUESTIONS.ANSWER_YES_NO)) {
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

    let lastQuestions: IQuestion[] = sessionAttributes['lastQuestions'];
    lastQuestions = lastQuestions ? lastQuestions :
                    await getQuestionsAround(sessionAttributes['longitude'], sessionAttributes['latitude'], sessionAttributes['tribeRadiusInKm']*1000);

    const currentQuestion = lastQuestions.pop();
    const isLast = !lastQuestions.length; 

    const introMessage = sessionAttributes['lastQuestions'] ? '' : 
                        `There ${lastQuestions.length + 1 > 1 ? 'are' : 'is'} ${lastQuestions.length + 1} question${lastQuestions.length + 1 > 1 ? 's' : ''} around you`;
    const repromptMessage = `Answer or skip ?`;
    const speechText = buildQuestionSpeechText(currentQuestion, isLast, introMessage, repromptMessage);

    sessionAttributes['lastQuestionId'] = currentQuestion ? currentQuestion._id : undefined;
    sessionAttributes['lastQuestions'] = lastQuestions;
    sessionAttributes['wasLastQuestion'] = isLast;
    sessionAttributes['previousIntent'] = 'GetQuestions';
    sessionAttributes['state'] = STATES.QUESTIONS.ANSWER_YES_NO;

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const response = handlerInput.responseBuilder.reprompt(repromptMessage).getResponse();
    response.outputSpeech = {
        type: 'SSML',
        ssml: speechText,
    };
    return response;
  },
};

function buildQuestionSpeechText(question: IQuestion, isLast: boolean, introMessage: string = '', repromptMessage: string = '') {
    return question ?
    `<speak>

        <p> ${introMessage} </p>

        <p> 
            ${question.nickname} asked: <voice name="${question.assignedPollyVoice}"> ${question.question} </voice>
        </p>

        <p>${isLast ? `This was the last one` : ``}</p>

        <p>${repromptMessage}</p>
 
    </speak>` :
    `<speak>
      <p>
        There are  no questions from your tribe right now.
      </p>
    </speak>`;
}