import { getPool } from '../../config/db';
import Logger from '../../config/logger';
import { ResultSetHeader } from 'mysql2'




const getAll = async () : Promise<User[]> => {
    Logger.info( `Getting all users from the database`);
    const conn = await getPool().getConnection();
    const query = 'select * from user';
    const [ rows ] = await conn.query( query );
    await conn.release();
    return rows;
};

const getUserByEmail = async (email: string) : Promise<User[]> => {
    Logger.info( `Getting user with email ${email} from the database` );
    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [ rows ] = await conn.query(query,[email] );
    await conn.release();
    return rows;
};



const getUserById = async (id: number) : Promise<User[]> => {
    Logger.info( `Getting user with id ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [ rows ] = await conn.query(query,[id] );
    await conn.release();
    return rows;
};

const insert = async (firstName: string, lastName:string, email:string, password:string, ) : Promise<ResultSetHeader> => {
    Logger.info( `Adding user ${firstName} ${lastName} to the database` );
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password, auth_token) values ( ?, ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [ firstName, lastName, email, password, 'token_placeholder'] );
    await conn.release();
    return result;
};

const updatePassword = async (id:number, password:string): Promise<User[]> => {
    Logger.info( `Altering user ${id} password from the database` );
    const conn = await getPool().getConnection();
    const query = 'update user set password = ? where id = ?';
    const [ rows ] = await conn.query(query, [password, id]);
    await conn.release();
    return rows;
}

const logout = async (token:string): Promise<any> => {
    Logger.info( `Logging out user with token ${token} from the database` );
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where auth_token = ?';
    const [ rows ] = await conn.query(query, ["", token]);
    return rows;
}

const updateToken = async (email: any, token: string)=> {
    Logger.info( `Updating user ${email}'s token in the database` );
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where email = ?';
    const [ rows ] = await conn.query(query, [token, email]);
    return rows;

}

const remove = async (id:number): Promise<any> => {
    Logger.info( `Deleting user ${id} from the database` );
    const conn = await getPool().getConnection();
    const query = 'delete from user where id = ?';
    const [ rows ] = await conn.query(query, [id]);
    return rows;
}

const executeSql = async (query:string): Promise<any> => {
    Logger.info( `Executing query` );
    const conn = await getPool().getConnection();
    const [ rows ] = await conn.query(query);
    return rows;
}

const getUserByToken = async (token:string): Promise<User[]> => {
    Logger.info( `Searching for user with token in database` );
    const conn = await getPool().getConnection();
    const query = 'select * from user where auth_token = ?'
    const [ rows ] = await conn.query(query, [token]);
    return rows;
}

export { getAll, getUserById, getUserByEmail, insert, updatePassword, remove, logout, updateToken,executeSql, getUserByToken}