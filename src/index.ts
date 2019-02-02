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
import { HelpHandler } from "./controllers/genericHandlers/helpHandler";
import { FallbackHandler } from "./controllers/genericHandlers/fallbackHandler";
import { ExitHandler } from "./controllers/genericHandlers/exitHandler";
import { ErrorHandler } from "./controllers/genericHandlers/errorHandler";

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    BroadcastMessageHandler,
    ReadLastMessagesHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(UserProfileInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();