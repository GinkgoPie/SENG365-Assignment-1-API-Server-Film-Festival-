import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';

const getImageById = async (id: number) : Promise<User[]> => {
    Logger.info( `Getting image for user with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'select image_filename from user where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};


export{getImageById};
