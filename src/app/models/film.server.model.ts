import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2'


const searchWithSql = async (sql: string) : Promise<Film[]> => {
    Logger.info( `Running sql to get films from the database` );
    const conn = await getPool().getConnection();
    conn.escape();
    const [ rows ] = await conn.query(sql);
    await conn.release();
    return rows;
};

const updateWithSql = async (sql: string) : Promise<Film[]> => {
    Logger.info( `Running sql to update films from the database` );
    const conn = await getPool().getConnection();
    conn.escape();
    const [ rows ] = await conn.query(sql);
    await conn.release();
    return rows;
};



const getFilmById = async (id: number) : Promise<Film[]> => {
    Logger.info( `Getting film with id ${id} from the database` );
    const conn = await getPool().getConnection();
    conn.escape();
    const query = 'select f.id as filmId, title, description, genre_id as genreId, director_id as directorId,u.first_name as directorFirstName, u.last_name as directorLastName,release_date as releaseDate, age_rating as ageRating, runtime, round(avg(coalesce(rating, 0)),1) as rating, count(r.id) as numReviews from (film f left join film_review r on f.id = r.film_id) left join user u on f.director_id = u.id where f.id = ? group by f.id'
    const [ rows ] = await conn.query(query,[id] );
    rows.rating = Number(rows.rating)
    await conn.release();
    return rows;
};

const getAllFilms = async () : Promise<Film[]> => {
    Logger.info( `Getting all films from the database` );
    const conn = await getPool().getConnection();
    const query = 'select f.id as filmId, title, genre_id as genreId, director_id as directorId,u.first_name as directorFirstName, u.last_name as directorLastName,release_date as releaseDate, age_rating as ageRating, round(avg(coalesce(rating, 0)),1) as rating from (film f left join film_review r on f.id = r.film_id) left join user u on f.director_id = u.id group by f.id order by releaseDate;'
    const [ rows ] = await conn.query(query);
    await conn.release();
    return rows;
};

const listAllGenres = async (): Promise<any[]>=> {
    Logger.info( `Getting all genres from the database` );
    const conn = await getPool().getConnection();
    const query =  'select id as genreId, name from genre';
    const [ rows ] = await conn.query(query);
    await conn.release();
    return rows;
};

const insert = async (title: string, description:string, genreId:number, releaseDate:string, runtime:number, director:number, ageRating:string ) : Promise<ResultSetHeader> => {
    Logger.info( `Adding film ${title} to the database` );
    const conn = await getPool().getConnection();
    const query = 'insert into film (title, description, genre_id, release_date, runtime, director_id, age_rating) values ( ?, ?, ?, ?, ?, ?,?)';
    const [ result ] = await conn.query( query, [title, description, genreId, releaseDate, runtime, director, ageRating] );
    await conn.release();
    return result;
};

const deleteWithSql = async (sql: string) : Promise<void> => {
    Logger.info( `Running sql to delete film from the database` );
    const conn = await getPool().getConnection();
    conn.escape();
    await conn.query(sql);
    await conn.release();
    return;
};

export { getFilmById, getAllFilms, searchWithSql, listAllGenres, insert, updateWithSql,deleteWithSql}