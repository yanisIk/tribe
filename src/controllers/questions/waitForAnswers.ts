import { RequestHandler, HandlerInput } from "ask-sdk";
import { Response, services, Intent } from 'ask-sdk-model';
import { IAnswer } from "../../models/Answer";
import { isIntentAndState } from "../../utils/alexaUtils";
import STATES from "../STATES";


/**
 * THIS IS EXPERIMENTAL
 * TRYING TO LOOP BETWEEN TWO DIFFERENT INTENTS TO KEEP ALEXA AWAKE AND MAKE HER TALK WHEN A NEW ANSWER COMES
 */


export const WaitForAnswersHandler : RequestHandler = {
    canHandle(handlerInput : HandlerInput) : boolean {
        if (isIntentAndState(handlerInput, 'WaitAnswersA')) {
            return true;
        } else if (isIntentAndState(handlerInput, 'WaitAnswersB')) {
            return true;
        } else {
            return false;
        }
    },
    async handle(handlerInput : HandlerInput) : Promise<Response> {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['state'] = STATES.WAITING_ANSWERS;

        const newAnswer = 'This is a new answer';

        const intentToChain = isIntentAndState(handlerInput, 'WaitAnswersA') ? 'WaitAnswersB' : 'WaitAnswersA'
        

        return handlerInput.responseBuilder
                .addDelegateDirective(
                {
                    name: intentToChain,
                    confirmationStatus: 'NONE',
                    slots: {
                        // @ts-ignore
                        emptySlot: {
                            name: 'emptySlot',
                            confirmationStatus: 'NONE'
                        }
                    }
                })
                .speak(newAnswer)
                .getResponse();
    }
     
};