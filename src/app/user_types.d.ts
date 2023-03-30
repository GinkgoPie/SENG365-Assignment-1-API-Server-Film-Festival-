type User = {
    /**
     * User id as defined by the database
     */
    id: number,
    /**
     * Users first name as entered when created
     */
    first_name: string,
    /**
     * Users last name as entered when created
     */
    last_name: string,
    /**
     * Users email as entered when created
     */
    email: string,
    /**
     * Users password as entered when created
     */
    password: string
    /**
     * User authorization token generated on log in
     */
    auth_token: string
    /**
     * User image file name
     */
    image_filename:string
}