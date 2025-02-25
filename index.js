require('dotenv').config();
// include the express modules

var express = require("express");

var session = require('express-session'); // import session to keep track of users
var app = express();

const passport = require('./passport'); // import the passport configuration
const PORT = 5001 || process.env.PORT; //port for server
// use sequelize orm for database
const db = require("./models");
const {User, Meal, RSVP} = require('./models');


const cors = require('cors'); // allows for cross orgin requests liek when using google auth
const { user } = require('./config/config');
const FRONTENDURL = "https://deltsdine.vercel.app"; // make null for dev
app.use(cors({
    origin: FRONTENDURL || 'http://localhost:3000', // or your frontend's URL
    methods: ['GET', 'POST'],
    credentials: true, // allow cookies to be sent
  }));

let SequelizeStore = require("connect-session-sequelize")(session.Store);

app.use(express.json()); // middleware for parsing

const sessionStore = new SequelizeStore({
    db: db.sequelize
  });
app.use(session({ // middleware for storing user info
    store: sessionStore,
    secret: "pooperscooper",
    saveUninitialized: true,
    resave: false,
    proxy: true,
    tableName: 'user_session',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // milisends * seconds * minutes * hours * days (7 days)
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    },
  }
));
// app.use((req, res, next) => {
//     console.log('Session:', req.session); // Log the session object for debugging
//     next();
//   });
// Sync the session store with the DB
sessionStore.sync();

app.use(passport.initialize());
app.use(passport.session());

// middleware function used in protected routes to ensure user is logged in
// in the future I think im going to protect all routes and just redirect people to login if they aren't
// or maybe have a landing page, so users can have option to relogin
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        // if user is authenticated, proceed 
        return next();
    }
    // send error if not authenticated
    res.status(401).send('Unauthorized: You must log in to access this resource.');
}

// middleware for checking if admin
function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        // if user is authenticated, proceed 
        return next();
    }
    // send error if not authenticated
    console.log("Error: User tried accessing admin protected route");

    res.status(401).send('Unauthorized: You must be admin');
}

// default route
app.get('/', (req, res) => {
    res.send('hello world');
});

// google auth route

app.get('/auth/google', passport.authenticate('google', {scope: ['email']}));
/** 
 * API for checking if the curent session is validated
 * @request GET
 * @resonse {authorized: boolean, userID: int || null, isAdmin: boolean || null}
 * 
*/
app.get('/api/validation', (req,res) => {
    console.log("user check auth api: " + req.session.isAuthenticated + "  user: " +req.session.userID, " isAdmin: " + req.session.isAdmin);
    console.log('Session:', req.session.isAuthenticated);
    // console.log(sessionStore);
    if (req.session.isAuthenticated) {
        res.json({authorized: true, userID:req.session.userID, isAdmin: req.session.isAdmin}); 
    } else {
        res.json({authorized: false})
    }
});


/**
 * API for setting the users name and mealPLan status
 * @request POST
 * @body {firstName: string, lastName: string, hasMealPlan: bool}
 * @response 200 ok || 500 server error
 */
 app.post('/api/setUser', isAuthenticated, async (req,res) => {
    const {firstName, lastName, hasMealPlan} = req.body;
    const parsedHasMealPlan =  hasMealPlan == "true" ? true : false; // prob back practice to convert to bool on backend, oh well..
    try {
        await User.update(
            {firstName: firstName, lastName: lastName, hasMealPlan: parsedHasMealPlan},
            { where: { userID: req.session.userID}}
        );
    } catch (err) {
        console.log(err);
        res.status(500).send("server error");
    }
    res.status(200).send("sucess!");
 })

// define the callback route for Google
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: FRONTENDURL || 'http://localhost:3000/' }), async (req, res) => {
    // successful authentication, redirect to another page
    
    req.session.isAuthenticated = true;
    req.session.userID = req.user.userID;
    console.log("login call back | is_auth:" + req.session.isAuthenticated + " id:" + req.session.userID);

    // fetch user isAdmin from db where userID = req.user.userID, to find admin status

    await User.findOne({where: {userID: req.user.userID}})
    .then((user) => {
        req.session.isAdmin = user.isAdmin;
        console.log("is admin: " + user.isAdmin);
    })
    .catch(err => {
        console.log(err);
    });
    
    // console.log(req.user.userID);
    if (req.user.firstName == null) {
        // console.log(req.session.isAuthenticated +"\n");
         // associate the UserID with the session object
        res.redirect(FRONTENDURL+ "?signUp=true" || 'http://localhost:3000/?signUp=true');
        // res.redirect('http://localhost:3000/');
    } else {
        res.redirect(FRONTENDURL + "?signUp=false" || 'http://localhost:3000/?signUp=false');
    }
  }
);
app.post('/api/logout', isAuthenticated, (req, res) => {
    // Destroy the session and handle the result
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
        res.status(500).send('Could not log out, server error');
      } else {
        res.status(200).json({ success: true });
      }
    });
  });
/* calculate the week id helper function (difference in # of weeks from 2024-01-01)
*  @param {date} Date object
*/ 
function calculateWeekID(date) {
    const startDate = new Date('2024-01-01T00:00:00Z'); // use  UTC time
    
    const diffTime = Math.abs(date - startDate);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    // console.log("diff weeks: " + diffWeeks);
    return diffWeeks;
}

// sync database, a function that ensures that the number of rsvps is the same as the number of spots avaliable - 
// ?? TODO

// all routes 
/**
 * API for adding new meals to the database
 * @request POST
 * @body {mealDate: date(yyyy-mm-dd), mealDescription: string, isLunch: bool, spotsAvaliable: int}
 * @response 200 ok || 500 server error
 * Also calculates the weekID of the meal startign from 2024-01-01
 */
app.post('/api/addMeal', isAuthenticated, isAdmin, async (req, res) => {
    
    const {description, date, isDinner, spotsAvaliable} = req.body;
    // console.log("meal Description: " + description + " mealDate: " + date + " isDinner: " + isDinner + " spotsAvaliable: " + spotsAvaliable);
    
    // calculate week id, so we can group meals by week
    
    const mealDate = new Date(date + "T00:00:00Z");
    // console.log(startDate +" <- start date, meal date -> " + mealDate);
    const weekID_ = calculateWeekID(mealDate); 
    console.log(mealDate.getDay());
    // can't create new meal if one already exists for that date and time
    const meal = await Meal.findOne({where: {date: mealDate, isDinner: isDinner}});
    if (meal) {
        console.log("[/api/addMeal] Meal already exists for that date\n");
        res.status(500).send("Meal already exists for that date");
        return;
    }
    // console.log("diff weeks: " + diffWeeks);
    await Meal.create({
        date: date, // date is the string in the format yyyy-mm-dd
        description: description,
        isDinner: isDinner,
        dayOfWeek: mealDate.getDay(),
        spotsAvaliable: spotsAvaliable,
        weekID: weekID_
    }).then((meal) => {
        res.status(200).send("Succesfully added meal")
    }).catch(err => {
        res.status(500).send("Server error when adding meal")
        console.log(err);
    });
});
/**
 * API for adding edditing meals in the database
 * @request POST
 * @body {mealDate: date(yyyy-mm-dd), mealDescription: string, isDinner: bool, spotsAvaliable: int}
 * @response 200 ok || 500 server error
 */
app.post('/api/editMeal', isAuthenticated, isAdmin, async (req, res) => {
    const {date, description, isDinner, spotsAvaliable} = req.body;
    const mealDate = new Date(date + "T00:00:00.000");
    try {
        // find meal by date and isDinner, ensure meal exists
        const meal = await Meal.findOne({where: {date: date, isDinner: isDinner}});
        if (!meal) {
            res.status(500).send("Meal does not exist for that date");
            return;
        }
        // update meal attributes if provided by client
        await Meal.update({
            description: description ? description : meal.description,
            spotsAvaliable: spotsAvaliable ? spotsAvaliable : meal.spotsAvaliable
        }, {where: {date: mealDate, isDinner: isDinner}});
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error when updating meal");
    }
});
/**
 * API for deleting meals from the db
 * @request POST
 * @body {mealID: int}
 * @response 200 ok {success:bool} || 500 server error
 */
app.post('/api/deleteMeal', isAuthenticated, isAdmin, async (req, res) => {
    console.log("hit delete meal endpoint");
    const {mealID} = req.body;
    if (!mealID) {
        res.status(400).send("no Meal provided");
        return;
    }
    try {
        const meal = await Meal.findOne({where: {mealID: mealID}});
        if (!meal) {
            res.status(500).send("Meal does not exist");
            return;
        }
        await RSVP.destroy({where: {mealID: mealID}});
        await Meal.destroy({where: {mealID: mealID}});
        res.status(200).json({success: true, message: "Meal deleted"});
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error when deleting meal");
    }

}); 

/**
 * API for fetchiing current week meal info for user
 * @request POST
 * @body {String ("yyyy-mm-dd"): currentDate}
 * @response {meals: [{mealID: int, mealName: string, mealDescription: string, mealDate: date}]}
 */
app.post('/api/getMenu', isAuthenticated, async (req, res) => {
    try {
        // console.log("hit get menu endpoint\n");
        const {currentDate} = req.body;
        

        console.log("date: " + currentDate);

        if (!currentDate) {
            res.status(400).send("not a valid date");
            return;
        }
        // get the week ID
        const weekID_ = calculateWeekID(new Date(currentDate + "T00:00:00Z"));
        console.log("weekID: " + weekID_);
        // incase we want to use current day for anything
        const mealDate = new Date(currentDate + "T00:00:00.000");
        // querty db for all meals for the week

        const meals = await Meal.findAll({where: {weekID: weekID_}});
        const packagedMeals = meals.map(meal => ({
            mealID: meal.dataValues.mealID,
            date: meal.dataValues.date,
            description: meal.dataValues.description,
            isDinner: meal.dataValues.isDinner,
            dayOfWeek: meal.dataValues.dayOfWeek,
            spotsTaken: meal.dataValues.spotsTaken,
            spotsAvailable: meal.dataValues.spotsAvaliable,
            weekID: meal.dataValues.weekID
        }));
        if (!meals) {
            res.status(500).send("Server error when fetching meals");
            return;
        }
        // console.log(packagedMeals);
        res.json({meals: packagedMeals});
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error when fetching meals");
    }
});
/**
 * API for creating a new rsvp on a given mealID
 * @request POST
 * @body {meals: [{mealID: int}]}
 * @response {success: bool, message: string}
 */
app.post('/api/newRSVP', isAuthenticated, async (req, res) => {
    const {mealID} = req.body;
    console.log(mealID);
    if (mealID == null) {
        res.json({success: false, message: "No mealID provided"});
        return;
    }
    const userID = req.session.userID;
    const user = await User.findOne({where: {userID: userID}});
    const meal = await Meal.findOne({where: {mealID: mealID}});

    // handle failure cases
    if (!user || !meal) {
        res.json({success: false, message: "User or meal not found"});
        return;
    }
    // make sure user isn't on full meal plan
    if (user.hasMealPlan == true) {
        res.json({success: false, message: "User is on a full meal plan"});
        return;
    }
    //make sure meal isn't monday dinner
    if (meal.isDinner && meal.dayOfWeek == 1) {
        res.json({success: false, message: "Can't register for Monday Dinner"});
        return;
    }
    // check to make sure user isn't already registered for 2 meals 
    const rsvps = await RSVP.findAll({where: {userID: userID, weekID: meal.weekID}});
    if(rsvps.length >= 2) {
        res.json({success: false, message: "User is already registered for 2 meals this week"});
        return;
    }
    // check if user has already registerefd for the meal
    const checkRegistered = await RSVP.findOne({where: {userID: userID, mealID: mealID}});
    if (checkRegistered) {
        res.json({success: false, message: "User is already registered for the meal"});
        return;
    }
    // check if meal is full
    if (meal.spotsTaken >= meal.spotsAvaliable) {
        res.json({success: false, message: "Meal is full"});
        return;
    }
    // create new RSVP
    try {
        await RSVP.create({ mealID: mealID, userID: userID, weekID: meal.weekID});
        // update meal spots taken
        await Meal.update({spotsTaken: meal.spotsTaken + 1}, {where: {mealID: mealID}});
        res.json({success: true, message: "RSVP created"});
    } catch (err) {
        console.log(err);
        res.json({success: false, message: "Server error when creating RSVP"});
    }

});
/** API for deleteing RSVPS
 * @request POST
 * @body {mealID: int}
 * @response {success: bool, message: string}
 */
app.post('/api/deleteRSVP', isAuthenticated, async (req, res) => {
    const {mealID} = req.body;
    const userID = req.session.userID;
    const user = await User.findOne({where: {userID: userID}});
    const meal = await Meal.findOne({where: {mealID: mealID}});
    if (!user || !meal) {
        res.json({success: false, message: "User or meal not found"});
        return;
    }
    //check if registered for full meal plan
    if (user.hasMealPlan == true) {
        res.json({success: false, message: "User is on a full meal plan"});
        return;
    }
    // check if meal is monday dinner
    if (meal.isDinner && meal.dayOfWeek == 1) {
        res.json({success: false, message: "Can't unregister for Monday Dinner"});
        return;
    }
    // make sure user was registered for the meal
    const checkRegistered = await RSVP.findOne({where: {userID: userID, mealID: mealID}});
    if (!checkRegistered) {
        res.json({success: false, message: "User is not registered for the meal"});
        return;
    }
    // delete the RSVP
    try {
        await RSVP.destroy({where: {userID: userID, mealID: mealID}});
        // update meal spots taken
        await Meal.update({spotsTaken: meal.spotsTaken - 1}, {where: {mealID: mealID}});
        res.json({success: true, message: "RSVP deleted"});
    } catch (err) {
        console.log(err);
        res.json({success: false, message: "Server error when deleting RSVP"});
    }
});
/** API for fetchin current weeks RSVP data
 * @request GET
 * @query ?date=Date
 * @response {rsvps: [{mealID: int, users: [{name: string}]}], selectedMeals: [int]}
 */
app.get('/api/getRSVPs', isAuthenticated, async (req, res) => {
   // get the date from the query parameters
    const date = req.query.date;
    
    if (!date) {
        res.status(400).send("No date provided");
        return;
    }
    // console.log(typeof date + " <-- type of date  ");
    const weekID = calculateWeekID(new Date(date + "T00:00:00Z"));
    if (!weekID) {
        res.status(400).send("No weekID provided");
        return;
    }
    try {
        const currentUserSelectedMeals = [];
        const meals = await Meal.findAll({where: {weekID: weekID}});
        const packagedRSVPs = [];
        
        for (const meal of meals) {
            let fullNames = [];
            const rsvps = await RSVP.findAll({where: {mealID: meal.mealID}});
            for (const rsvp of rsvps) {
                const users = await User.findAll({where: {userID: rsvp.userID}});
                
                users.forEach(user => {
                    fullNames.push(user.firstName + " " + user.lastName);
                    if (user.userID === req.session.userID) {
                        currentUserSelectedMeals.push(meal.mealID);
                    }
                });
            }
            
            let mealRoster = {mealID: meal.mealID, users: fullNames};
           
            packagedRSVPs.push(mealRoster); 
        }
        // console.log("request ", currentUserSelectedMeals);
        res.json({rsvps: packagedRSVPs, selectedMeals: currentUserSelectedMeals});
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error when fetching RSVPs");
    }
});

app.post('/api/test', (req, res) => {
    res.send("test");
});

app.get('/profile', isAuthenticated, (req, res) => {
  res.json({ message: `Welcome ${req.user.googleID}` });
});

// ----------------below this are just testign routes----------------------------------
app.get('/select', isAuthenticated, (req, res) => {
    User.findOne( {where: {firstName: "chet"}})
    .then((users) => {
        res.send(users);
    })
    .catch(err => {
        console.log(err);
    });
});
/**
 * API for making someone an admin
 * @request POST
 * @body {firstName: string, lastName: string, email: string || null}
 * @response 200 ok || 500 error
 */
app.post('/makeAdmin', isAuthenticated, isAdmin, (req, res) => {
    console.log("hit make admin endpoint");
    const {firstName, lastName, email} = req.body;
    try {
        const users = User.findAll({where: {firstName: firstName, lastName: lastName}});
        if (users.length == 1) {
            User.update({isAdmin: true }, {where: {firstName: firstName, lastName: lastName}});
            res.status(200).send("successfully made new admin");
        } else if (users.length != 1 && email == null) {
            res.status(400).send("Multiple users with that name, please provide email");
        } else {
            User.update({isAdmin: true }, {where: {email: email}});s
            res.status(200).send("successfully made new admin");
        }
    
    } catch (err) {
        res.status(500).send("Server error when making admin");
        console.log("makeAdmin Errored: \n" + err);
    }
    console.log("successfullly made admin: " + firstName + " " + lastName);
});
    
app.get('/deletequew392934', isAuthenticated, isAdmin, (req, res) => {
    User.destroy({where: {isAdmin: False}})
    .then(result => {

    })
    .catch(err => {
        if (err) {
            console.log(err);
        }
    });
    res.send('delete');
});
/*
    sequalize.sync ensures that our object model is the same as the actual db schema,
    useful for devlopment but probably shouldn't be used in production because we might
    accidently drop a table if we alter our model schema
*/
// db.sequelize.sync({alter: true}).then((req) => {
app.listen(process.env.PORT || 5001, () => {
    console.log("lsitneing on: "+ FRONTENDURL ||  " http://localhost:3001\n");

});
// });

// db.sequelize.sync({ force: true }).then(() => {
//     // Sync Meal model first
//     return db.Meal.sync();
//   }).then(() => {
//     // Sync User model second
//     return db.User.sync();
//   }).then(() => {
//     // Finally, sync RSVP model, which depends on Meal and User
//     return db.RSVP.sync();
//   }).then(() => {
//     app.listen(process.env.PORT || PORT, () => {
//       console.log("Listening on port:  " + process.env.PORT || PORT);
//     });
//   }).catch((err) => {
//     console.error('Error syncing models:', err);
//   });
