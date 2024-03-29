import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';




const getImageById = async (id: number) : Promise<User[]> => {
    Logger.info( `Getting image for user with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};

const setImageById = async (id: number, image: any) : Promise<void> => {
    Logger.info( `Setting image for user with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'Update user set image_filename = ? where id = ?';
    const [ rows ] = await conn.query(query,[ image,id] );
    await conn.release();
    return rows;
};

const deleteImageById = async (id: number) : Promise<void> => {
    Logger.info( `Deleting image for user with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'Update user set image_filename = null where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};


export{getImageById,setImageById,deleteImageById};
