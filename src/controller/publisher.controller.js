import {Author, Book} from "../model/index.js";
import {sequelize} from "../config/database.js";
import {QueryTypes} from "sequelize";

export const findPublishersByAuthor = async (req, res) => {
    const author = await Author.findByPk(req.params.name)
    if (!author) {
        return res.status(404).send({error: `Author ${req.params.name} not found`});
    }
    // 1
    // const books = await author.getBooks()
    // const publishers = [...new Set(books.map(book => book.publisher))]
    // return res.json(publishers)

    //2
    // const books = await Book.findAll({
    //     include: {
    //         model: Author,
    //         as: 'authors',
    //         where: {name: req.params.name},
    //         through: {
    //             attributes: []
    //         }
    //     },
    //     attributes: ['publisher'],
    //     raw: true,
    //     group: ['publisher']
    // })
    // return res.json(books.map(book => book.publisher));

    // 3
    // const publishers = await Book.aggregate('publisher', 'DISTINCT',{
    //     plain: false,
    //     include: {
    //         model: Author,
    //         as: 'authors',
    //         where: {name: req.params.name},
    //         through: {
    //             attributes: [],
    //         }
    //     }
    // })
    // return res.json(publishers.map(p => p.DISTINCT));

    // 4
    const publishers = await sequelize.query(`
    SELECT DISTINCT b.publisher 
    FROM books b
    JOIN books_authors ba ON b.isbn = ba.isbn
    JOIN authors a ON ba.author_name = a.name
    WHERE a.name = :name
    `, {
        replacements: {name: req.params.name},
        type: QueryTypes.SELECT
    })
    return res.json(publishers.map(p => p.publisher));
}