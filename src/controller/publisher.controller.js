import {Author, Book} from "../model/index.js";

export const findPublishersByAuthor = async (req, res) => {
    const author = await Author.findByPk(req.params.author, {
        include: {
            model: Book,
            as: 'books',
            attributes: ['publisher'],
            through: { attributes: [] },
            include: [
                {
                    model: Author,
                    as: 'authors',
                    attributes: [],
                    through: { attributes: [] }
                }
            ]
        }
    })
    const result = !author?.books ? [] : author.books.map(pub => pub.publisher)
    return res.json([...new Set(result)])
}