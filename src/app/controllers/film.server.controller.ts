import {Request, Response} from "express";
import * as films from "../models/film.server.model";
import * as schemas from '../resources/schemas.json';
import Ajv from "ajv";
import addFormats from "ajv-formats";
import Logger from "../../config/logger";


const ajv = new Ajv({removeAdditional: 'all', strict: false});
addFormats(ajv)

const validate = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = await validator(data);
        if(!valid)
            return ajv.errorsText(validator.errors); return true;
    } catch (err) {
        return err.message;
    }
}

const buildQuery = async (req: Request) => {

    let sql = 'select f.id as filmId, title, genre_id as genreId, director_id as directorId, first_name as directorFirstName, last_name as directorLastName,release_date as releaseDate, age_rating as ageRating, rating from (film f left join (select round(avg(rating),1) as rating, user_id as reviewer_id, film_id from film_review group by film_id ) r on f.id = r.film_id) left join user d on director_id = d.id';
    sql = sql + ' where '
    if (req.query.q) {
        sql = sql + '(title like "%' + req.query.q+ '%" or description like "%' + req.query.q+ '%") and ';
    }
    if (req.query.directorId) {
        sql = sql + 'd.id=' + req.query.directorId + ' and ';
    }
    if (req.query.reviewerId) {
        sql = sql + 'reviewer_id=' + req.query.reviewerId + ' and ';
    }
    if (req.query.genreIds.length>1) {
        const genreIds  = req.query.genreIds as string[];
        sql = sql + '(genre_id=' + genreIds[0] + ' or genre_id=' +genreIds[1] + ') and ';
    }
    if (req.query.ageRatings.length>1) {
        const ageRatings  = req.query.ageRatings as string[];
        sql = sql + '(age_rating ="' + ageRatings[0] + '" or age_rating ="'+ ageRatings[1] +'")';
    }

    if (sql.endsWith(' and ')){
        sql = sql.slice(0, -5);
    }

    sql = sql + ' group by film_id';
    if (req.query.sortBy) {
        const sort: {[key: string]: string} = {"ALPHABETICAL_ASC": "title ASC",
            "ALPHABETICAL_DESC" :"title DESC",
            "RELEASED_ASC" : "releaseDate ASC",
            "RELEASED_DESC" : "releaseDate DESC",
            "RATING_ASC": "rating ASC",
            "RATING_DESC" : "rating DESC"};
        sql = sql + ' order by ' + sort[req.query.sortBy as string];
    }
    Logger.info(sql)
    return sql;
}





const viewAll = async (req: Request, res: Response): Promise<void> => {
    // const validation = await validate(
    //     schemas.film_search,
    //     req.body);
    // if (validation !== true) {
    //     res.statusMessage = `Bad Request: ${validation.toString()} `;
    //     res.status(400).send();
    //     return;
    // }
    try{
        if (!req.params){
            const result = await films.getAllFilms();
            for (const row of result) {
                if (row.rating !== null) {
                    row.rating = Number(row.rating);
                }
            }
            res.status(200).send({"films":result, "count":result.length});
            return;
        } else {
            const query = buildQuery(req);
            const result = await films.searchWithSql(await query);
            const start = parseInt(req.query.start as string,10)
            const count = parseInt(req.query.count as string,10)
            for (const row of result) {
                if (row.rating !== null) {
                    row.rating = Number(row.rating);
                }
            }
            res.status(200).send({"films":result.slice(start,start+count), "count":result.length});
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getOne = async (req: Request, res: Response): Promise<void> => {
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

const addOne = async (req: Request, res: Response): Promise<void> => {
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

const editOne = async (req: Request, res: Response): Promise<void> => {
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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
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

const getGenres = async (req: Request, res: Response): Promise<void> => {
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

export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};