const router = require('express').Router()
const Author = require('../models/author')
const fs = require('fs')
const path =require('path')
const Book = require('../models/book')
const uploadPath = path.join('public',Book.coverImageBasePath)
const multer = require('multer')
const imageMimeTypes = ['image/jpeg','image/png','image/gif']
const upload = multer({
    dest :uploadPath,
    fileFilter : (req,file,callback)=>{
        //callback(error,condition)
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//get all books

router.get('/', async (req,res)=>{
    let query = Book.find()
    if(req.query.title){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedBefore){
        query = query.lte('publishDate',req.query.publishedBefore)
    }
    if(req.query.publishedAfter){
        query = query.gte('publishDate',req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index',{
            books,
            searchOptions : req.query
        })
    } catch{
        res.redirect('/')
    }
})

//new books form
router.get('/new',async(req,res)=>{
    renderNewPage(res,new Book())

})

//new book creation

router.post('/',upload.single('cover'),async (req,res)=>{
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title : req.body.title,
        description : req.body.description,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        coverImageName : fileName,
        author : req.body.author
    })
    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        removeBookCover(book.coverImageName)
        renderNewPage(res,book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName), err =>{
       if(err) console.error(err);
    })
}

async function renderNewPage(res, book , hasError = false){
    
    try {
        const authors = await Author.find({})
        const params = {
            authors ,
            book
        }
        if(hasError) {params.errorMessage = 'Error while creating book'}
        res.render('books/new',params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router