const express = require("express");
const bodyParser = require("body-parser");
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

let tasks = ["Buy food", "Study", "Workout"];

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

  // passing back parameter day to front EJS parameter kindOfDay
  res.render("list", {
    kindOfDay: day,
    newListItems: tasks
  });
});

app.post("/", function(req, res){
  tasks.push(req.body.newItem);
  // redirect to the home route to trigger to app.get
  // task has to be a global variable in order to use it in app.get
  res.redirect("/");
})

app.listen(const, function(){
  console.log("Server started on port 3000.");
});
