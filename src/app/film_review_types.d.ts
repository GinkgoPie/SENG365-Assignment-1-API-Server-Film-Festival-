type Review = {
    /**
     * Review id as defined by the database
     */
    id: number,
    /**
     * Id of the film that was reviewed
     */
    film_id: number,
    /**
     * Id of the user who make the review
     */
    user_id: number,
    /**
     * Rating given by user to the film
     */
    rating: number,
    /**
     * User's review comment
     */
    review: string
    /**
     * Time stamp when the review was made
     */
    timestamp: string
}