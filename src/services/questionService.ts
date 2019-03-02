import { Question, IQuestion } from "../models/Question";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getActiveQuestion(userId: string): Promise<IQuestion> {
    await checkAndConnectMongoose();
    const activeQuestion = await Question.find({
        userId: userId
    }).sort({createdAt: 'desc'}).limit(1).lean().exec();
    return activeQuestion.length ? activeQuestion[0] : null;
}

export async function getQuestionsAround(long: number, lat: number, radiusInMeters: number = 5000, limit = 5): Promise<IQuestion[]> {
    await checkAndConnectMongoose();
    return await Question.find({
        locationPoint: {
            $nearSphere: {
                $geometry: {
                   type: "Point" ,
                   coordinates: [ long , lat ]
                },
                $maxDistance: radiusInMeters,
                // $minDistance: 1
              }
        }
    }).sort({createdAt: 'desc'}).limit(limit).lean().exec();
}

export async function getQuestionsByCity(city: string, limit = 10): Promise<IQuestion[]> {
    await checkAndConnectMongoose();
    return await Question.find({
        "locationDetails.city": city
    }).sort({createdAt: 'desc'}).limit(limit).lean().exec();
}

export async function insertQuestion(message: IQuestion): Promise<IQuestion> {
    await checkAndConnectMongoose();
    return await Question.create(message);
}  