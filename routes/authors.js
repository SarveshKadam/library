const router = require('express').Router()
const Author = require('../models/author')

//All author users
router.get('/',async (req,res)=>{
    let searchOptions = {}
    if(req.query.name != null || req.query.name == ''){
        searchOptions.name = new RegExp(req.query.name,'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index',{
            authors,
            searchOptions : req.query})
    } catch (error) {
        res.redirect('/')
    }
})

//New author route

router.get('/new',(req,res)=>{
    res.render('authors/new',{author : new Author()})
})

//Create new author

router.post('/',async (req,res)=>{
    const author = new Author({
        name : req.body.name
    })

    try {
      const newAUthor = await author.save()
    } catch (error) {
        res.render('authors/new',{
            author : author,
            errorMessage : 'Error while creating author'
        })
    }

})

module.exports = router