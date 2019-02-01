import { UserProfile, IUserProfile } from "../models/UserProfile";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getUserProfile(userId: string): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.findOne({userId: userId}).lean();
}

export async function getUserProfilesAround(long: number, lat: number, radius: number): Promise<IUserProfile[]> {
    await checkAndConnectMongoose();
    return await UserProfile.find({
        locationPoint: { $geoWithin: {$geometry: {type: 'Point', coordinates: [long, lat]}}}
    }).lean();
}

export async function getUserProfilesByCity(city: string): Promise<IUserProfile[]> {
    await checkAndConnectMongoose();
    return await UserProfile.find({
        "locationDetails.city": city
    }).lean();
}

export async function upsertUserProfile(userId: string, userProfile: IUserProfile): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.updateOne({userId: userId}, userProfile).lean();
}  