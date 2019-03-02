import { Answer, IAnswer } from "../models/Answer";
import { checkAndConnectMongoose } from "../utils/mongooseUtils";

export async function getAnswersByQuestion(questionId, limit = 5): Promise<IAnswer[]> {
    await checkAndConnectMongoose();
    return await Answer.find({
        questionId: questionId,
    }).sort({createdAt: 'desc'}).limit(limit).lean().exec();
}

export async function insertAnswer(answer: IAnswer): Promise<IAnswer> {
    await checkAndConnectMongoose();
    return await Answer.create(answer);
}  