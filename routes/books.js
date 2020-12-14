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

//show a book

router.get('/:id',async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book})
        
    } catch {
        res.redirect('/')
    }
})

//edit page

router.get('/:id/edit',async (req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book)
    } catch{
        res.redirect('/')
    }
    
})

//edit the book
router.put('/:id',async (req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title,
        book.description = req.body.description,
        book.publishDate = new Date(req.body.publishDate),
        book.pageCount = req.body.pageCount,
        book.author = req.body.author
        if(req.body.cover){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if(book){
            renderEditPage(res,book,true)
        }else{
        res.redirect('/')
        }
    }
})

//delete the book
router.delete('/:id',async (req,res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if(book){
            res.render('books/show',{
                book,
                errorMessage :"Could not remove book"
            })
        }else{
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book , hasError = false){
    renderFormPage(res,book,'new',hasError)
}

async function renderEditPage(res, book , hasError = false){
    renderFormPage(res,book,'edit',hasError)
}

async function renderFormPage(res, book ,form, hasError = false){
    
    try {
        const authors = await Author.find({})
        const params = {
            authors ,
            book
        }
        if(hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error while updating the book'
            }else{
                params.errorMessage = 'Error while creating book'
            }
        }
        res.render(`books/${form}`,params)
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