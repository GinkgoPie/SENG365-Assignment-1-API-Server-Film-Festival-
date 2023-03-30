import {Request, Response} from "express";
import * as films from "../models/film.server.model";
import * as schemas from '../resources/schemas.json';
import Logger from "../../config/logger";
import {validate} from '../validate';
import {ParamsDictionary} from "express-serve-static-core";
import * as users from "../models/user.server.model";
import {ResultSetHeader} from "mysql2";
import {getPool} from "../../config/db";
import {deleteWithSql} from "../models/film.server.model";


const isNumeric = async (value:any)=> {
    return /^-?\d+$/.test(value);
}

const buildQuery = async (req: Request) => {

    let sql = 'select f.id as filmId, title, genre_id as genreId, director_id as directorId, first_name as directorFirstName, last_name as directorLastName,release_date as releaseDate, age_rating as ageRating, (coalesce(rating, 0)) as rating from (film f left join (select round(avg(coalesce(rating, 0)),1) as rating, user_id as reviewer_id, film_id from film_review group by film_id ) r on f.id = r.film_id) left join user d on director_id = d.id';
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
    if (req.query.genreIds !== undefined) {
        if (req.query.genreIds.length>1) {
            const genreIds  = req.query.genreIds as string[];
            sql = sql + '(genre_id=' + genreIds[0] + ' or genre_id=' +genreIds[1] + ') and ';
        }
    }

    if (req.query.ageRatings !== undefined) {
        if (req.query.ageRatings.length > 1) {
            const ageRatings = req.query.ageRatings as string[];
            sql = sql + '(age_rating ="' + ageRatings[0] + '" or age_rating ="' + ageRatings[1] + '")';
        }
    }

    if (sql.endsWith(' and ')){
        sql = sql.slice(0, -5);
    }
    if (sql.endsWith('where ')){
        sql = sql.slice(0, -6);
    }
    if (req.query.sortBy) {
        const sort: {[key: string]: string} = {"ALPHABETICAL_ASC": "title ASC",
            "ALPHABETICAL_DESC" :"title DESC",
            "RELEASED_ASC" : "releaseDate ASC",
            "RELEASED_DESC" : "releaseDate DESC",
            "RATING_ASC": "rating ASC",
            "RATING_DESC" : "rating DESC"};
        sql = sql + ' order by ' + sort[req.query.sortBy as string] + ', f.id ASC';
    }
    else if (req.query.sortBy === undefined) {
        sql = sql + ' order by ' + 'releaseDate ASC'
    }
    Logger.info(sql)
    return sql;
}

const verifyReleaseDate = async (req: Request, res: Response)=> {
    const datetime = new Date();
    const date = ("0" + datetime.getDate()).slice(-2);
    const month = ("0" + (datetime.getMonth() + 1)).slice(-2);
    const year = datetime.getFullYear();
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const seconds = datetime.getSeconds();
    const currentTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    if (req.body.releaseDate !== undefined && req.body.releaseDate < currentTime ){
        res.statusMessage = `releaseDate in past `;
        res.status(403).send();
    }
    return;
}



const viewAll = async (req: Request, res: Response): Promise<void> => {
    const validation = await validate(
        schemas.film_search,
        req.query)
    Logger.info(validation);
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()} `;
        res.status(400).send();
        return;
    } else{
        if (req.query.startIndex !== undefined && isNaN(req.query.startIndex as any)){
            res.status(400).send();
            return;
        }else if (req.query.count !== undefined && isNaN(req.query.count as any)){
            res.status(400).send();
            return;
        }else if (req.query.directorId !== undefined && isNaN(req.query.directorId as any)){
            res.status(400).send();
            return;
        }else if (req.query.reviewerId !== undefined && isNaN(req.query.reviewerId as any)){
            res.status(400).send();
            return;
        }else if (req.query.genreIds !== undefined) {
            if (Number(req.query.genreIds) > 12 || Number(req.query.genreIds) < 1) {
                res.status(400).send();
                return;}
            for (const genreId of req.query.genreIds as string[]) {
                if (isNaN(genreId as any)) {
                    res.status(400).send();
                    return;
                } else if (Number(genreId) > 12 || Number(genreId) < 1) {
                    res.status(400).send();
                    return;
                }
            }
        }
    }
    let startIndex = 0;
    if(req.query.startIndex){
        startIndex = parseInt(req.query.startIndex as string, 10)
    }
    try{
        if (req.query.q || req.query.directorId ||req.query.reviewerId ||req.query.startIndex ||req.query.count ||req.query.sortBy ||req.query.genreIds ||req.query.ageRatings ){
            Logger.info("GET film with parameters")
            const query = buildQuery(req);
            const result = await films.searchWithSql(await query);
            let count = result.length;
            if(req.query.count){
                count = parseInt(req.query.count as string,10)
            }
            for (const row of result) {
                if (row.rating !== 0.0) {
                    row.rating = Number(row.rating);
                } else {
                    row.rating = 0
                }
            }
            res.status(200).send({"films":result.slice(startIndex,startIndex+count), "count":result.length});
            return;
        } else {
            Logger.info("GET all films")
            const result = await films.getAllFilms();
            let count = result.length;
            if(req.query.count){
                count = parseInt(req.query.count as string,10)
            }
            for (const row of result) {
                if (row.rating !== 0.0) {
                    row.rating = Number(row.rating);
                } else {
                    row.rating = 0
                }
            }
            res.status(200).send({"films":result.slice(startIndex,startIndex+count), "count":result.length});
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
        const result = await films.getFilmById(parseInt(req.params.id, 10));
        if (result[0] === undefined) {
            res.status(404).send("Film not found");
            return;
        }
        result[0].rating = Number(result[0].rating);
        res.status(200).send(result[0]);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addOne = async (req: Request, res: Response): Promise<void> => {
    await verifyReleaseDate(req, res);
    const validation = await validate(
        schemas.film_post,
        req.body)
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()} `;
        res.status(400).send();
        return;
    }
    if (req.header("X-Authorization") === undefined) {
        res.status(401).send();
        return;
    }
    try{
        const title = req.body.title;
        const description = req.body.description;
        const genreId = parseInt(req.body.genreId, 10);
        const releaseDate = req.body.releaseDate || null;
        const runtime = parseInt(req.body.runtime, 10)|| null;
        const ageRating = req.body.ageRating || null;
        const director = await users.getUserByToken(req.header("X-Authorization"));
        const result = await films.insert(title, description, genreId, releaseDate, runtime, director[0].id, ageRating);
        res.status(201).send({ "filmId": result.insertId });
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editOne = async (req: Request, res: Response): Promise<void> => {
    if (req.header("X-Authorization") === undefined) {
        res.status(401).send("Unauthorized for this operation");
        return;
    }
    const validation = await validate(
        schemas.film_patch,
        req.body)
    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()} `;
        res.status(400).send();
        return;
    }
    const filmID = req.params.id;
    if (isNaN(filmID as any)) {
        res.status(404).send("Invalid film id for this operation");
        return;
    }
    await verifyReleaseDate(req, res);
    try{
        let sql = 'update film set '
        if(req.body.title !== undefined) {
            sql = sql + 'title="' + req.body.title +'", ';
        }
        if(req.body.description !== undefined) {
            sql = sql + 'description="' + req.body.description +'", ';
        }
        if(req.body.genreId !== undefined) {
            sql = sql + 'genre_id=' + Number(req.body.genreId) +', ';
        }
        if(req.body.runtime !== undefined) {
            sql = sql + 'runtime=' + Number(req.body.runtime) +', ';
        }
        if(req.body.ageRating !== undefined) {
            sql = sql + 'age_rating="' + req.body.ageRating +'", ';
        }
        if(req.body.releaseDate !== undefined) {
            sql = sql + 'release_date="' + req.body.releaseDate +'", ';
        }
        sql = sql.slice(0, -2);
        sql = sql + ' where id=' + req.params.id;
        const result = films.updateWithSql(sql);
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    if (req.header("X-Authorization") === undefined) {
        res.status(401).send("Unauthorized for this operation");
        return;
    }
    try{
        const filmId = req.params.id;
        const token =  req.header("X-Authorization");
        const director = await users.getUserByToken(token);
        if (director[0].id === undefined) {
            res.status(403).send("Unauthorized for this operation");
            return;
        } else {
            const sql = 'delete from film where director_id = ' + director[0].id + ' and id =' + filmId;
            await films.deleteWithSql(sql);
            res.status(200).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getGenres = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await films.listAllGenres();
        res.status(200).send(result);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}



export {viewAll, getOne, addOne, editOne, deleteOne, getGenres};