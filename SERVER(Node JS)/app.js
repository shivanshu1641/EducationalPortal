var express = require("express"), 
	mongoose = require("mongoose"), 
	passport = require("passport"), 
	bodyParser = require("body-parser"), 
	LocalStrategy = require("passport-local"), 
	passportLocalMongoose = 
		require("passport-local-mongoose"), 
	User = require("./models/user"); 
const Article = require("./models/article");
const { createIndexes } = require("./models/article");

const url = require('url');

mongoose.set('useNewUrlParser', true); 
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true); 
mongoose.set('useUnifiedTopology', true); 
mongoose.connect("mongodb://localhost/auth_demo_app"); 

var app = express(); 
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
var cors = require('cors')
app.use(cors(4200)) 

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

const fileUpload = require("express-fileupload");
app.use(fileUpload());

app.use(require("express-session")({ 
	secret: "Rusty is a dog", 
	resave: false, 
	saveUninitialized: false
})); 
app.use("/assets",express.static(__dirname + '/assets'));
//app.use("/articles",articleRouter)
app.use(passport.initialize()); 
app.use(passport.session()); 

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 



//===================== 
// ROUTES 
//===================== 

// Showing home page 
app.get("/", function (req, res) { 
	res.render("home"); 
}); 

// Showing secret page 


// Showing register form 
app.get("/register", function (req, res) { 
	res.render("register"); 
}); 

// Handling user signup 
app.post("/register", function (req, res) { 
	var username = req.body.username 
	var password = req.body.password 
	console.log(req.body.username)
	User.register(new User({ username: username }), 
			password, function (err, user) { 
		if (err) { 
			console.log(err); 
			return res.render("register"); 
		} 

		passport.authenticate("local")( 
			req, res, async function () { 
				const articles = await Article.find()

			res.send({"message":"Succesfully Registered"})
		}); 
	}); 
}); 

//Showing login form 
app.get("/login", function (req, res) { 
	res.render("login"); 
}); 


app.post('/login', function(req, res,next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
		res.send({"error":err})
		
      }
      if (!user) {
        res.send({
          message: 'No Such user'
        });
      }
      req.login(user, function(err) {
        if (err) {
          return next(err);
        }
		else {
			console.log(req.body.username);
			console.log(req.body.password);
			return res.send({"message":"LoggedIn"})
		}
        res.send({
          message: 'logged in'
        });
      });
    })(req, res, next);
  });


//sending a get data for product
app.route("/data")
.get(async(req,res) =>{
	result = await Article.find().select({__v:0});
	res.send(result)
})
.delete(async(req,res)=>{
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject);
	  console.log(req.body);

	  let ids = queryObject.id;
	  let result = await Article.deleteOne({_id:{$in:ids}});
	  res.send(result);
})

app.post('/updata', async(req,res)=>{
	console.log(req.params);
    console.log(req.body);
    console.log(req.files);
    console.log(`Project_Dir: ${__dirname}`);

    var file_to_upload = req.files.thefile;
    var file_path = 'D:/Project/esd/src/assets/img/dbimages/'+file_to_upload.name;
    console.log(file_path);
    file_to_upload.mv(file_path);

	let article = new Article({
		category:req.body.category,
        title: req.body.title,
        description: req.body.description,
        price: req.body.markdown,
        file: file_to_upload.name
    })
    try{
   article = await  article.save();
   res.send(article)
    }
    catch(e){
        console.log(e)
		res.send(e)
    }
})

//Search an element
app.post("/search", async (req,res) =>{
	var search = req.body.search;
	var fin = 0
	var mfin = 0
	var idf = 0
	var result = await Article.find().select({__v:0});
	//res.send(result)
	var search_arr = search.split(" ");
	for (var i=0; i<result.length;i++){
		fin = 0
		var result_arr = result[i].description.split(" ");
		console.log(result_arr,search)
		for (var k=0; k< result_arr.length;k++){
			for(var j=0; j<search_arr.length; j++){
				if(result_arr[k].toLowerCase() == search_arr[j].toLowerCase()){
					fin = fin+1;
					console.log("True")
				}
			}
		}
		if (fin>mfin){
			mfin = fin;
			idf = result[i]._id;
		}
	}
	console.log(idf,mfin)
	var find = await Article.find({_id:{$eq:idf}});
	console.log(find)
	var cat = find[0].category;
	var send = await Article.find({category:{$eq:cat}})
	val = [{"cat":cat,"idf":idf}]
	res.send(val)

})

app.get("/actualsearch",async(req,res)=>{
	const queryObject = url.parse(req.url,true).query;
	console.log(queryObject);
	let cat = queryObject.category
	console.log(cat)
	result = await Article.find({category:{$eq:cat}});
	console.log(result)
	res.send(result)
})


app.get("/secret", isLoggedIn, async (req, res) =>{ 
	const articles = await Article.find()
	res.render("secret",{ articles: articles}); 
	console.log(articles);
}); 

//Handling user logout 
app.get("/logout", function (req, res) { 
	req.logout(); 
	res.redirect("/"); 
}); 

function isLoggedIn(req, res, next) { 
	if (req.isAuthenticated()) return next(); 
	res.redirect("/login"); 
} 

var port = process.env.PORT || 3000; 
app.listen(port, function () { 
	console.log("3000 Server Has Started!"); 
}); 


