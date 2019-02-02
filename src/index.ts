import * as Alexa from "ask-sdk";
const skillBuilder = Alexa.SkillBuilders.standard();

export const mongooseContainer = {isConnected: false};

// Import handlers
import { LaunchRequestHandler } from "./controllers/welcomeHandler";
import { BroadcastMessageHandler } from "./controllers/broadcastMessageHandler";
import { ReadLastMessagesHandler } from "./controllers/readLastMessagesHandler";

// Import interceptors
import { UserProfileInterceptor } from "./controllers/interceptors/userProfileLoader";

// Import generic handlers
import { SessionEndedRequestHandler } from "./controllers/genericHandlers/sessionEndedRequestHandler";


/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    BroadcastMessageHandler,
    ReadLastMessagesHandler,
    // HelpHandler,
    // RepeatHandler,
    // ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(UserProfileInterceptor)
//   .addErrorHandlers(ErrorHandler)
  .lambda();