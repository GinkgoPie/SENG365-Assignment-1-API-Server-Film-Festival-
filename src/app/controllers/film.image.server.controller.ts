import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as filmsImages from '../models/film.image.server.model';
import * as films from '../models/film.server.model';
import * as usersImages from "../models/user.image.server.model";
import * as mime from "mime-types";
import * as fs from "mz/fs";
import * as users from "../models/user.server.model";


const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id as any)) {
            res.status(400).send("Bad request")
            return;
        }
        const film = await filmsImages.getImageById(id);
        const filmImage = film[0].image_filename;
        if(film[0] === undefined) {
            res.status(403).send("No film found for this id")
            return;
        }
        if (filmImage === null||filmImage === undefined) {
            res.status(404).send("No image found")
            return;
        }
        const contentType = mime.contentType(film[0].image_filename)
        if (!contentType){
            res.status(404).send("No image found")
            return;
        }
        fs.readFile('./storage/images/' + filmImage, (err, data) => {
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
        const getFilm = await films.getFilmById(parseInt(req.params.id,10));
        if(getFilm[0] === undefined) {
            res.status(403).send("No film found for this id")
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
        const director = await users.getUserByToken(req.header("X-Authorization"));
        if (director[0].id !== getFilm[0].directorId) {
            res.status(401).send("No authorization");
            return;
        }
        const filmImage = req.body;
        const filePath = './storage/images/film_'+ id +'.jpg';
        await fs.writeFile(filePath , filmImage, err => {
            if (err) throw err;
            filmsImages.setImageById(id, 'film_'+id + '.jpg');
            res.status(201).send();
            return;})
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getImage, setImage};