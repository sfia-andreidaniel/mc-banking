import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {AppDataSource} from "../data-source";
import {User} from "../entities/User";
import {Config} from "../config/config";
import {errorFormatter} from "../helpers/errorFormatter";

const userRepository = AppDataSource.getRepository(User);
const config = new Config();

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {

    const token = (req.header('Authorization') || '').split(' ')[1];
    const tokenType = (req.header('Authorization') || '').split(' ')[0].toLowerCase();

    if (tokenType !== 'bearer') {
        return res.status(401)
            .json(errorFormatter('Access denied. Expected token type Bearer'));
    }

    if (!token) {
        return res.status(401)
            .json(errorFormatter('Access denied. No token provided.'));
    }

    try {

        const userId: number = await new Promise<number>((resolve, reject) => {

            jwt.verify(token, config.jwt.secret, (err, decoded) => {

                if (err) {
                    reject(new Error("Invalid token (" + err + ")"));
                    return;
                }

                resolve((<any>decoded).userId);
            });

        });

        req.user = await userRepository.findOneOrFail({where: {id: userId}});

        next();

    } catch (e) {

        return res.status(401).json(errorFormatter(e));

    }
}