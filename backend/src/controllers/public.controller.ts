import { Response, Request } from 'express';
import { Topic } from '../models';
export const getTopics = async (req: Request, res: Response): Promise<void> => {
    try {
        const topics = await Topic.findAll({
            where: { is_active: true },
            attributes: ['id', 'name', 'description'],
        });
        res.status(200).json({ success: true, data: topics });
    } catch (error: any) {
        console.error('Get topics error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch topics', error: error.message });
    }
};
