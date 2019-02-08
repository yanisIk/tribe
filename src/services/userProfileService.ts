import { UserProfile, IUserProfile } from "../models/UserProfile";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getUserProfile(userId: string): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.findOne({userId: userId}).lean().exec();
}

export async function getUserProfilesAround(long: number, lat: number, radius: number, limit = 10): Promise<IUserProfile[]> {
    await checkAndConnectMongoose();
    return await UserProfile.find({
        locationPoint: {
            $nearSphere: {
                $geometry: {
                   type: "Point" ,
                   coordinates: [ long , lat ]
                },
                $maxDistance: radius,
                // $minDistance: 0
              }
        }
    }).limit(limit).lean().exec();
}

export async function getUserProfilesByCity(city: string, limit = 10): Promise<IUserProfile[]> {
    await checkAndConnectMongoose();
    return await UserProfile.find({
        "locationDetails.city": city
    }).limit(limit).lean().exec();
}

export async function createOrUpdateUserProfile(userProfile: IUserProfile): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    if (await getUserProfile(userProfile.userId)) {
        return await updateUserProfile(userProfile.userId, userProfile);
    }
    return await UserProfile.create(userProfile);
}  

export async function updateUserProfile(userId: string, userProfile: IUserProfile): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.updateOne({userId: userId}, userProfile).lean().exec();
}  