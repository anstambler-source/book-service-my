import {Author, Book, Publisher} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const jsonBook = {
    include: [
        {
            model: Author,
            as: 'authors',
            attributes: {
                include: ['name', [sequelize.col('birth_date'), 'birthDate']],
                exclude: ['birth_date']
            },
            through: {
                attributes: []
            }
        }
    ]
}

export const addBook = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true});
    try {
        const {isbn, title, authors, publisher} = req.body;
        const existingBook = await Book.findByPk(isbn, {transaction: t});
        if (existingBook) {
            await t.rollback()
            return res.status(409).send({error: `Book with ISBN ${isbn} already exists`});
        }
        // Create or find the publisher
        if (!await Publisher.findByPk(publisher, {transaction: t})) {
            await Publisher.create({publisher_name: publisher}, {transaction: t});
        }

        // Process the authors
        const authorRecords = [];
        for (const author of authors) {
            let authorRecord = await Author.findByPk(author.name, {transaction: t});
            if (!authorRecord) {
                authorRecord = await Author.create({
                    name: author.name,
                    birth_date: new Date(author.birthDate),
                }, {transaction: t});
            }
            authorRecords.push(authorRecord);
        }
        // Create a new book
        const book = await Book.create({isbn, title, publisher}, {transaction: t});
        await book.setAuthors(authorRecords, {transaction: t});
        await t.commit();
        return res.status(201).send({message: `Book with ISBN ${isbn} added successfully`});
    } catch (e) {
        await t.rollback();
        console.log(`Error adding book:`, e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to add book'
        });
    }
}

export const findBookByIsbn = async (req, res) => {
    const book = await Book.findByPk(req.params.isbn, jsonBook);
    if (book) {
        return res.json(book);
    }
    return res.status(404).send({error: `Book with ISBN ${req.params.isbn} not found`});
}

export const removeBook = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true});
    try {
        const book = await Book.findByPk(req.params.isbn, {...jsonBook, transaction: t});
        if (book) {
            await book.destroy({transaction: t});
            await t.commit()
            return res.json(book);
        } else {
            await t.rollback();
            return res.status(404).send({error: `Book with ISBN ${req.params.isbn} not found`});
        }
    } catch (e) {
        await t.rollback();
        console.log(`Error remove book:`, e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to remove book'
        })
    }
}

export const updateBookTitle = async (req, res) => {
    const t = await sequelize.transaction({readOnly: true});
    try {
        const book = await Book.findByPk(req.params.isbn, {...jsonBook, transaction: t});
        if (!book) {
            await t.rollback();
            return res.status(404).send({error: `Book with ISBN ${req.params.isbn} not found`});
        }
        book.title = req.params.title;
        await book.save({transaction: t});
        await t.commit()
        return res.json(book);
    } catch (e) {
        await t.rollback();
        console.log(`Error update title of book:`, e);
        return res.status(500).send({
            error: e.message,
            message: 'Failed to update title of book'
        })
    }
}

export const findBooksByAuthor = async (req, res) => {
    const author = await Author.findOne({
        where: { name: req.params.author },
        include: {
            model: Book,
            as: 'books',
            through: { attributes: [] },
            include: [
                {
                    model: Author,
                    as: 'authors',
                    attributes: {
                    include: ['name', [sequelize.col('birth_date'), 'birthDate']],
                    exclude: ['birth_date']
                },
                    through: { attributes: [] }
                }
            ]
        }
    });
    return res.json(author?.books || []);
}

export const findBooksByPublisher = async (req, res) => {
    const publisher = await Publisher.findByPk(req.params.publisher, {
        include: {
            model: Book,
            as: 'books',
            include: [
                {
                    model: Author,
                    as: 'authors',
                    attributes: {
                        include: ['name', [sequelize.col('birth_date'), 'birthDate']],
                        exclude: ['birth_date']
                    },
                    through: { attributes: [] }
                }
            ]
        }
    })
    return res.json(publisher?.books || [])
}