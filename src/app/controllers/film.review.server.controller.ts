import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as reviews from "../models/review.server.model";
import * as schemas from '../resources/schemas.json';
import * as films from "../models/film.server.model";
import * as users from "../models/user.server.model";
import {validate} from '../validate';


const getReviews = async (req: Request, res: Response): Promise<void> => {
    try{
        const filmId = req.params.id;
        if (filmId === undefined || isNaN(filmId as any)) {
            res.status(401).send("Invalid film id");
            return;
        }
        const results = await reviews.searchReviewsByFilmId(parseInt(filmId,10));
        res.status(200).send(results);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


const addReview = async (req: Request, res: Response): Promise<void> => {
    try{
        if (req.header("X-Authorization") === undefined) {
            res.status(401).send("Unauthorized for this operation");
            return;
        }
        const film = await films.getFilmById(parseInt(req.params.id,10));
        if (film[0].filmId === undefined){
            res.status(404).send("Film not found");
            return;
        }
        const validation = await validate(
            schemas.film_review_post,
            req.body)
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()} `;
            res.status(400).send();
            return;
        }
        const rating = parseInt(req.body.rating,10);
        const user = await users.getUserByToken(req.header("X-Authorization"));
        const userId = user[0].id;
        if (userId === undefined){
            res.status(403).send("Unauthorized for this operation, please log in");
            return;
        }
        const review = req.body.review || null;
        await reviews.addReview(film[0].filmId, userId, rating, review);
        res.status(201).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



export {getReviews, addReview}