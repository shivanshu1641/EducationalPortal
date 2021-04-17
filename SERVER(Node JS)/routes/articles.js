const express = require("express")
const router = express.Router()
const Article = require("./../models/article")


//app.use(bodyParser.json())
router.get('/new', (req,res) =>{
    //res.send("In articles")
    res.render("articles/new",{article: new Article()});
})

router.get('/:id', async (req,res) =>{
    const article = await Article.findById(req.params.id)
    if (article == null) res.redirect('/')
    res.render('articles/show',{article: article})
})

router.post('/',async (req,res) =>{
    if (req.files){
        console.log(req.files)
        var file = req.file.thefile
        var filename = file.name
        console.log(filename) 
        var file_path = __dirname + '/uploads/'+file.name;
        console.log(file_path);
        file.mv(__dirname + '/uploads');
    }
    var file_to_upload = req.file.thefile;
    var file_path = __dirname + '\\uploads\\'+file_to_upload.name;
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        file: file_path
    })
    try{
   article = await  article.save();
   res.redirect(`articles/${article.id}`)
    }
    catch(e){
        console.log(e)
        res.render('articles/new',{article:article})
    }
})
module.exports = router