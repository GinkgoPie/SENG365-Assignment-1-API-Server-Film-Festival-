type Film = {
    /**
     * Film id as defined by the database
     */
    filmId: number,
    /**
     * Film title as entered when created
     */
    title: string,
    /**
     * Film description as entered when created
     */
    description: string,
    /**
     * Film release date as entered when created
     */
    releaseDate: object,
    /**
     * Film image filename as entered when created
     */
    imageFilename: string
    /**
     * Film run time
     */
    runtime: number
    /**
     * Film director Id
     */
    directorId: number
    /**
     * Film genre id
     */
    genreId: number
    /**
     * Film age rating
     */
    ageRating: number
    /**
     * Director first name
     */
    directorFirstName: string
    /**
     * Director last name
     */
    directorLastName: string
    /**
     * Rating of the film
     */
    rating: number

}
