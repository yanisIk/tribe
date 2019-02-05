import { HandlerInput } from "ask-sdk";
import { getUserInfos } from "../../utils/alexaUtils";
import { IUserProfile } from "../../models/UserProfile";
import { getUserProfile } from "../../services/userProfileService";

export const UserProfileInterceptor = {
    async process(handlerInput: HandlerInput): Promise<void> {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (sessionAttributes['nickname']) return Promise.resolve();
        
        const {userId, deviceId, coordinate} = getUserInfos(handlerInput);

        const userProfile: IUserProfile = await getUserProfile(userId);

        if (!userProfile) return;

        sessionAttributes['userId'] = userId;
        sessionAttributes['nickname'] = userProfile.nickname;
        sessionAttributes['voiceGender'] = userProfile.voiceGender;
        sessionAttributes['assignedPollyVoice'] = userProfile.assignedPollyVoice;
        sessionAttributes['longitude'] = userProfile.locationPoint.coordinates[0];
        sessionAttributes['latitude'] = userProfile.locationPoint.coordinates[1];
        sessionAttributes['city'] = userProfile.locationDetails.city;
        sessionAttributes['country'] = userProfile.locationDetails.country;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return Promise.resolve();

    },
  };