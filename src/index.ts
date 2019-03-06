import { SkillBuilders } from "ask-sdk-core";

// Import handlers
import { AskGeoPermissionHandler } from "./controllers/genericHandlers/askGeoPermissionHandler";
import { AskForCountryPostalCodePermission } from "./controllers/genericHandlers/askCountryPostalcodePermissionHandler";
import { LaunchRequestHandler } from "./controllers/welcomeHandler";
import { BroadcastMessageHandler } from "./controllers/messages/broadcastMessageHandler";
import { ReadLastMessagesHandler } from "./controllers/messages/readLastMessagesHandler";
import { UserProfileSetupHandler } from "./controllers/options/userProfileSetupHandler";
import { ChangeLocationHandler, ResetLocationHandler } from "./controllers/options/changeLocationHandler";
import { GetUserProfile } from "./controllers/options/getMyUserProfileInfosHandler";

import { AskQuestionHandler } from './controllers/questions/askQuestionHandler';
import { AnswerQuestionHandler, YesNoAnswerQuestionHandler } from './controllers/questions/answerQuestionHandler';
import { GetQuestionsHandler } from './controllers/questions/getQuestionsHandler';
import { GetAnswersHandler } from './controllers/questions/getAnswersHandler';


// Import interceptors
import { UserProfileInterceptor } from "./controllers/interceptors/userProfileLoader";
import { AudioCleanerResponseInterceptor } from "./controllers/interceptors/audioCleanerResponseInterceptor";


// Import generic handlers
import { SessionEndedRequestHandler } from "./controllers/genericHandlers/sessionEndedRequestHandler";
import { HelpHandler } from "./controllers/genericHandlers/helpHandler";
import { FallbackHandler } from "./controllers/genericHandlers/fallbackHandler";
import { ExitHandler } from "./controllers/genericHandlers/exitHandler";
import { ErrorHandler } from "./controllers/genericHandlers/errorHandler";


let skill;

exports.handler = async (event, context) => {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!skill) {
    skill = SkillBuilders.custom()
      .addRequestHandlers(
        // AskForCountryPostalCodePermission,
        LaunchRequestHandler,
        UserProfileSetupHandler,
        ChangeLocationHandler,
        ResetLocationHandler,
        GetUserProfile,
        BroadcastMessageHandler,
        ReadLastMessagesHandler,
        AskQuestionHandler,
        AnswerQuestionHandler,
        YesNoAnswerQuestionHandler,
        GetQuestionsHandler,
        GetAnswersHandler,
        HelpHandler,
        ExitHandler,
        FallbackHandler,
        SessionEndedRequestHandler
      )
      .addErrorHandlers(ErrorHandler)
      .addRequestInterceptors(UserProfileInterceptor)
      .create();
  }

  const response = await skill.invoke(event, context);

  return response;
};
