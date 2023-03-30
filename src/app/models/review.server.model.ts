import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2'


const searchReviewsByFilmId = async (filmId: number): Promise<Review[]>=> {
    Logger.info( `Getting all reviews with film id ${filmId}` );
    const conn = await getPool().getConnection();
    const query =  'select user_id as reviewerId, first_name as reviewerFirstName, last_name as reviewerLastName, rating, review, timestamp from ((select * from film_review where film_id = ?) q left join user u on q.user_id = u.id) ORDER by timestamp DESC';
    const [ rows ] = await conn.query(query, [filmId]);
    await conn.release();
    return rows;
};

const addReview = async (filmId: number, userId: number, rating: number, review: string): Promise<Review[]>=> {
    Logger.info( `Creating review in data base` );
    const conn = await getPool().getConnection();
    const query =  'insert into film_review (film_id, user_id, rating, review) values ( ?, ?, ?, ?)';
    const [ rows ] = await conn.query(query, [filmId, userId, rating, review]);
    await conn.release();
    return rows;
};

export{searchReviewsByFilmId, addReview}