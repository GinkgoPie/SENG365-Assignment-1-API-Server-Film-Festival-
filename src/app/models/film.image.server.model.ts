import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2';


const getImageById = async (id: number) : Promise<Film[]> => {
    Logger.info( `Getting image for film with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'select * from film where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};

const setImageById = async (id: number, image: any) : Promise<void> => {
    Logger.info( `Setting image for film with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'Update film set image_filename = ? where id = ?';
    const [ rows ] = await conn.query(query,[ image,id] );
    await conn.release();
    return rows;
};

const deleteImageById = async (id: number) : Promise<void> => {
    Logger.info( `Deleting image for film with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'Update film set image_filename = null where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};


export{getImageById,setImageById,deleteImageById};