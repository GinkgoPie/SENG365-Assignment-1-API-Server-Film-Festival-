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


export function getFilmsWithTitle(q: string) {
   return;
}


const getFilmById = async (id: number) : Promise<Film[]> => {
    Logger.info( `Getting film with id ${id} from the database` );
    const conn = await getPool().getConnection();
    conn.escape();
    const query = 'select * from film where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};

const getAllFilms = async () : Promise<Film[]> => {
    Logger.info( `Getting all films from the database` );
    const conn = await getPool().getConnection();
    const query = 'select f.id as filmId, title, genre_id as genreId, director_id as directorId,u.first_name as directorFirstName, u.last_name as directorLastName,release_date as releaseDate, age_rating as ageRating, round(avg(rating), 1) as rating from (film f left join film_review r on f.id = r.film_id) left join user u on f.director_id = u.id group by f.id order by releaseDate;'
    const [ rows ] = await conn.query(query);
    await conn.release();
    return rows;
};

export { getFilmById, getAllFilms, searchWithSql}