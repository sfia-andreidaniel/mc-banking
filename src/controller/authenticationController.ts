import {Request, Response} from 'express';
import {User} from "../entities/User";
import {AppDataSource} from "../data-source";
import {AuthenticationService} from "../services/AuthenticationService";
import {errorFormatter} from "../helpers/errorFormatter";

const userRepository = AppDataSource.getRepository(User);
const authenticationService = new AuthenticationService();

export const currentUser = async (req: Request, res: Response, ) => {
    res.status(200).json(req.user?.toJson(true));
};

export const signIn = async (req: Request, res: Response,) => {

    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json(errorFormatter('Email and password are required.'));
    }

    const user = await userRepository.findOne({where: {email}});

    if (!user || !user.checkPassword(password)) {
        return res.status(401).json(errorFormatter('Invalid email or password.'));
    }

    return res.status(200).json(authenticationService.generateJWT(user));
}

export const signUp = async (req: Request, res: Response,) => {

    let validationResult = User.createUserValidator().validate(req.body);

    if (null !== validationResult) {
        return res.status(400).json(errorFormatter(validationResult));
    }

    try {

        const {email, password} = req.body;
        const user = new User();

        user.email = email;
        user.setPassword(password);


        await userRepository.save(user);

        return res.status(201).json(user.toJson())


    } catch (e) {

        return res.status(400).json(errorFormatter('Failed to create account'));

    }

}