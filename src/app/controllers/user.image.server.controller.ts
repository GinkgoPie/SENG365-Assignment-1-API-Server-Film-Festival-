import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as usersImages from '../models/user.image.server.model';
import * as schemas from '../resources/schemas.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'mz/fs';
import * as mime from "mime-types";



const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        const users = await usersImages.getImageById(id);
        const userImage = users[0].image_filename;
        if (userImage === null) {
            res.status(404).send("No image found")
            return;
        }
        const contentType = mime.contentType(users[0].image_filename)
        if (!contentType){
            res.status(404).send("No image found")
            return;
        }
        res.writeHead(200,{'Content-Type': contentType}).send(users[0].image_filename);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const setImage = async (req: Request, res: Response): Promise<void> => {
    if (req.header("X-Authorization") === undefined) {
        res.status(401).send();
        return;
    }
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try{
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage, deleteImage}