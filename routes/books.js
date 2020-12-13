const router = require('express').Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg','image/png','image/gif']


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

router.post('/',async (req,res)=>{
    const book = new Book({
        title : req.body.title,
        description : req.body.description,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        author : req.body.author
    })
    if(req.body.cover){
    saveCover(book, req.body.cover)
    }
    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        renderNewPage(res,book, true)
    }
})



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

function saveCover(book,coverEncoded){
    let cover
    if(coverEncoded === null) return
    if(coverEncoded){
        cover = JSON.parse(coverEncoded)
    }
    if(cover && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data,'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router