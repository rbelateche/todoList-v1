const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// connect to local database
//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// connect to remote MongoDB Atlas Cluster's database
// replace <password> by password of afmin-rbelateche
// delete where it puts the default databse instead of todolistDB
mongoose.connect("mongodb+srv://admin-rbelateche:CFH2Ay9ER4e3z3g@cluster0.y8wbf.mongodb.net/todolistDB", {useNewUrlParser: true});

// create a new Item Schema
const ItemsSchema = {
  name: String
};

// new mongoose model
const Item = mongoose.model("Item", ItemsSchema);

// create 3 new docs
const task1 = new Item ({
  name: "Work"
});
const task2 = new Item ({
  name: "Eat"
});
const task3 = new Item ({
  name: "Party"
});



// array to store the default Items
const defaultItems = [task1, task2, task3];



// creating a new List Schema
const listSchema = {
  name : String,
  items: [ItemsSchema]
};

// Creating Mongoose Model
const List = mongoose.model("List", listSchema);




// GET request, with date process
// GET : request data from database,
// and passing arguments to front
app.get("/", function(req, res){
  let today = new Date();

  // options object to use for day formatting
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  // format day to get the correspondant string
  let day = today.toLocaleDateString("en-US", options);



  // calling find to get the items from DB
  //if defaultItems is empty, then insert the default tasks
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      //saving default items in DB, passing the array
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Inserted");
        }
      });
    }
    console.log(foundItems);
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  })
});



// EXPRESS Routing
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        // if list doesn't exist, then create one
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        // if list already exists, then display the list
          res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});




// POST : send data to server/database
// after getting changes from front
app.post("/", function(req, res){
  const itemName = req.body.newItem;

  const listName = req.body.list;
  console.log(listName);

  const newTask = new Item ({
    name: itemName
  });



  // check if title is : today, or actual list

  if (listName === "Today"){
    newTask.save();
    res.redirect("/");
  } else {
    // list model already exist , so we just push the item to items array of the List model
    List.findOne({name: listName}, function(err, returnedList){
      returnedList.items.push(newTask);
      returnedList.save();
      console.log(returnedList);
      res.redirect("/" + listName);

    });
  }



});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listOfItems = req.body.listName;
  console.log("listOfItems : " + listOfItems);

  if (listOfItems === "Today"){
    // remove item from items
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("item removed");
        res.redirect("/");
      }
    });
  } else {
    // remove item from its list
    // find the list
    // look for the item in the list by its id, then delete it
    List.findOneAndUpdate(
      {name: listOfItems},
      { $pull : {items : {_id : checkedItemId}}},
      function(err, foundList){
        if (!err){
          console.log(foundList);
          res.redirect("/" + listOfItems);
        }
      }
    );
  }

});


app.listen(port, function(){
  console.log("Server started on port 3000.");
});
