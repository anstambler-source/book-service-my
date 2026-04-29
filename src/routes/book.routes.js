import express from "express";
import {addBook, findBookByIsbn, removeBook} from "../controller/book.controller.js";

const router = express.Router();

router.post('/book', addBook)
router.get('/book/:isbn', findBookByIsbn)
router.delete('/book/:isbn', removeBook)

export default router;