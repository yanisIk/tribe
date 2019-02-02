import { HandlerInput } from "ask-sdk";
import { getUserInfos } from "../../utils/alexaUtils";
import { IUserProfile } from "../../models/UserProfile";
import { getUserProfile } from "../../services/userProfileService";

export const UserProfileInterceptor = {
    async process(handlerInput: HandlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (sessionAttributes['nickname']) return;
        
        const {userId, deviceId, coordinate} = getUserInfos(handlerInput);
        const userProfile: IUserProfile = await getUserProfile(userId);

        if (!userProfile) return;

        sessionAttributes['nickname'] = userProfile.nickname;
        sessionAttributes['assignedPollyVoice'] = userProfile.assignedPollyVoice;
        sessionAttributes['city'] = userProfile.locationDetails.city;
        sessionAttributes['country'] = userProfile.locationDetails.country;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    },
  };