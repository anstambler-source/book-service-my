import {Author, Book} from "../model/index.js";
import {jsonBook} from "./book.controller.js";
import {sequelize} from "../config/database.js";

export const findBookAuthors = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn, {...jsonBook});
    if (!book) {
        return res.status(404).send({error: `Book with ISBN ${req.params.isbn} not found`});
    }
    return res.json(book.authors);
}

export const removeAuthor = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true})
    try {
        const author = await Author.findByPk(req.params.author, {
            transaction: t,
            attributes: {
                include: ['name', [sequelize.col('birth_date'), 'birthDate']],
                exclude: ['birth_date']
            }
        })
        if (!author) {
            await t.rollback()
            return res.status(404).send({error: `Author ${req.params.author} not found`});
        }
        await author.destroy({transaction: t});
        await t.commit()
        return res.json(author);
    }catch(e) {
        await t.rollback()
        console.log(`Error remove Author:`, e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to remove Author',
        });
    }
}