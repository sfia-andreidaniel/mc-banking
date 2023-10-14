import {User} from "../entities/User";
import jwt from 'jsonwebtoken';
import {Config} from "../config/config";

export class AuthenticationService {

    private readonly config: Config;

    constructor() {
        this.config = new Config();
    }

    public generateJWT(user: User): string {

        return jwt.sign({userId: user.id, email: user.email}, this.config.jwt.secret, {
            expiresIn: '1h', // Set the token expiration time
        });
    }

}