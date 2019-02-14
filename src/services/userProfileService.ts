import { UserProfile, IUserProfile } from "../models/UserProfile";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";
import * as request from "request-promise";

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

export async function upsertUserProfile(userProfile: IUserProfile): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.updateOne({userId: userProfile.userId}, userProfile, {upsert: true, setDefaultsOnInsert: true}).lean().exec();
}  

export async function updateUserProfile(userId: string, userProfile: IUserProfile): Promise<IUserProfile> {
    await checkAndConnectMongoose();
    return await UserProfile.updateOne({userId: userId}, userProfile).lean().exec();
}  

export async function getLocationDetailsByCityAndCountryName(cityName: string, countryName: string): Promise<{countryCode: string, lat: number, lon: number, city: string}> {

    const locationDetails = await request.get({
        url: encodeURIComponent(`https://us1.locationiq.com/v1/search.php?key=712e088a5520d8&q=${cityName} ${countryName}&addressdetails=1&format=json`),
        json: true
    });

    return {countryCode: locationDetails[0].address.country_code, lat: locationDetails[0].lat, lon: locationDetails[0].lon, city: locationDetails[0].address.city || locationDetails[0].address.county};
}