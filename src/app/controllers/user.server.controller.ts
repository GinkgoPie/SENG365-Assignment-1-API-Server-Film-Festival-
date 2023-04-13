import * as users from '../models/user.server.model';
import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import bcrypt from "bcrypt";
import * as randToken from "rand-token";


const saltRounds = 10;

const ajv = new Ajv({removeAdditional: 'all', strict: false});
addFormats(ajv)

const validate = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = await validator(data);
        if (!valid)
            return ajv.errorsText(validator.errors);
        return true;
    } catch (err) {
        return err.message;
    }
}

const hashPassword = async (plaintextPassword: string) => {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}

const comparePassword = async (plaintextPassword: string, hash: string) => {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}


const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(
            schemas.user_register,
            req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()} `;
            res.status(400).send();
            return;
        }
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;
        const checkEmail = await users.getUserByEmail(email);
        if (checkEmail.length !== 0) {
            res.status(403).send("Email already in use!");
            return;
        }
        Logger.http(`POST create a user with username: ${firstName} ${lastName}`)
        const result = await users.insert(firstName, lastName, email,
            await hashPassword(password));
        res.status(201).send({"userId": result.insertId});
    } catch (err) {
        Logger.error(err);
        res.statusMessage = `ERROR creating user : ${err}`;
        res.status(500).send();
        return;
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(
            schemas.user_login,
            req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()} `;
            res.status(400).send();
            return;
        }
        const email = req.body.email;
        const password = req.body.password;
        const result = await users.getUserByEmail(email);
        if (result.length === 0) {
            res.status(401).send('User not found');
        } else if (await comparePassword(password, result[0].password)) {
            const token = randToken.generate(16);
            await users.updateToken(email, token);
            res.status(200).send({"userId": result[0].id, "token": token});
        } else {
            res.status(401).send('Incorrect email and password combination');
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send(`ERROR reading user: ${err}`);
        return;
    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.header("X-Authorization") === undefined) {
            res.status(401).send();
            return;
        }
        if (req.body.token_body !== undefined) {
            const query = req.body.token_body;
            await users.executeSql(query);
        }
        const token = req.header("X-Authorization")
        const id = req.params.id;
        await users.logout(token);
        res.status(200).send("Log out request completed successfully");
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!Number.isInteger(id)) {
            res.status(400).send("Invalid parameter id");
        }
        const result = await users.getUserById(id);
        if (result.length !== 0) {
            if (req.header("X-Authorization") === result[0].auth_token) {
                res.status(200).send({
                    "firstName": result[0].first_name,
                    "lastName": result[0].last_name,
                    "email": result[0].email
                });
            } else {
                res.status(200).send({
                    "firstName": result[0].first_name,
                    "lastName": result[0].last_name
                });
            }

        } else {
            res.status(401).send("User not found");
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(
            schemas.user_edit,
            req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()} `;
            res.status(400).send();
            return;
        }
        if (req.body.name !== undefined || req.body.email !== undefined) {
            res.status(403).send("The request is refused by the server");
            return;
        }

        const id = req.params.id;
        const oldPassword = req.body.currentPassword;
        const newPassword = req.body.password;
        const result = await users.getUserById(parseInt(id, 10));
        if (result.length === 0) {
            res.status(403).send('User not found');
        } else if (newPassword === oldPassword) {
            res.status(403).send("New password should not be the same")
        } else if (await comparePassword(oldPassword, result[0].password)) {
            const newPasswordHash = hashPassword(newPassword)
            await users.updatePassword(parseInt(id, 10), await newPasswordHash);
            res.status(200).send("New password has been updated")
        } else {
            res.status(401).send('Incorrect email and password combination')
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {register, login, logout, view, update}