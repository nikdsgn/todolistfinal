//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//// const items = ["Buy Food", "Cook Food", "Eat Food"];
//// const workItems = [];

mongoose.connect("mongodb+srv://admin-nik:Testat123@cluster0-xrkil.mongodb.net/todolistDB", {useNewUrlParser: true});



const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);










const item1 = new Item ({
  name: "Welcome to your do-list."
});
const item2 = new Item ({
  name: "Hit plus to add."
});
const item3 = new Item ({
  name: "Hit this to delete."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Succesfully saved to the server!");
//   }
// });

// Item.deleteOne({ name: 'Welcome to your do-list.' }, function (err) {});
// Item.deleteOne({ name: 'Hit plus to add.' }, function (err) {});
// Item.deleteOne({ name: 'Hit this to delete.' }, function (err) {});


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){

        if (foundItems.length === 0) {
             Item.insertMany(defaultItems, function(err){
               if (err) {
                 console.log(err);
               } else {
                 console.log("Succesfully saved to the server!");
               }
             });
             res.redirect("/");
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
  //  console.log(foundItems);
 });

  // res.render("list", {listTitle: "Today", newListItems: items});

});

app.get("/:customListName", function(req, res){
  // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err, foundList){
  if (!err){
    if (!foundList){
//      console.log("Doesn't exists.");
//create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
    } else {
//     console.log("It exists.");
// show and existing list
res.render("list", {listTitle: foundList.name, newListItems: foundList.items} );
  }}
});


});





app.post("/", function(req, res){

//  const item = req.body.newItem;

///   if (req.body.list === "Work") {
///     workItems.push(item);
///     res.redirect("/work");
///   } else {
///     items.push(item);
///     res.redirect("/");
///   }

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
  item.save();
  res.redirect("/");
} else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});



app.post("/delete", function(req, res){
//  console.log(req.body.checkbox);
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("Succesfully deleted an entry from database.");
      res.redirect("/");
    }
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
  if (!err){
    res.redirect("/" + listName);
  }
});

}});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Succesfully.");
});
