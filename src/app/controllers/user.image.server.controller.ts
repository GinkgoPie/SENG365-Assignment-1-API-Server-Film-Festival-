import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImages from '../models/user.image.server.model';
import * as users from '../models/user.server.model';
import * as schemas from '../resources/schemas.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'mz/fs';
import * as mime from "mime-types";



const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id as any)) {
            res.status(400).send("Bad request")
            return;
        }
        const user = await usersImages.getImageById(id);
        const userImage = user[0].image_filename;
        if(user[0].id === undefined) {
            res.status(403).send("No user found for this id")
            return;
        }
        if (userImage === null||userImage === undefined) {
            res.status(404).send("No image found")
            return;
        }
        const contentType = mime.contentType(user[0].image_filename)
        if (!contentType){
            res.status(404).send("No image found")
            return;
        }
        fs.readFile('./storage/images/' + userImage, (err, data) => {
            if (err) throw err;
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        })
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const setImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const getUser = await users.getUserById(parseInt(req.params.id,10));
        if(getUser[0] === undefined) {
            res.status(403).send("No user found for this id")
            return;
        }
        if (req.header("X-Authorization") === undefined) {
            res.status(401).send();
            return;
        }
        const id = parseInt(req.params.id, 10);
        if (isNaN(id as any)) {
            res.status(400).send("Bad request")
            return;
        }
        const user = await users.getUserByToken(req.header("X-Authorization"));
        if (user[0].id !== id) {
            res.status(401).send("No authorization");
            return;
        }
        const userImage = req.body;
        const filePath = './storage/images/user_'+ id +'.jpg';
        await fs.writeFile(filePath , userImage, err => {
            if (err) throw err;
            usersImages.setImageById(id, 'user_'+id + '.jpg');
            res.status(201).send();
            return;})
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try{
        if (req.header("X-Authorization") === undefined) {
            res.status(401).send();
            return;
        }
        const id = parseInt(req.params.id, 10);
        if (isNaN(id as any)) {
            res.status(400).send("Bad request")
            return;
        }
        const user = await users.getUserByToken(req.header("X-Authorization"));
        if (user[0].id !== id) {
            res.status(401).send("No authorization");
            return;
        }
        await usersImages.deleteImageById(id);
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}