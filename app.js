const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://Raman:sani123@cluster0.o7dew.mongodb.net/todolistDB");

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workList = [];
const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = {
    name: String,
    list: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

const buyFood = new Item({
    name: "Buy Food"
});

const cookFood = new Item({
    name: "Cook Food"
});

const eatFood = new Item({
    name: "Eat Food"
});

const defaultItems = [buyFood, cookFood, eatFood];








app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {



    Item.find({}, function (error, docs) {

        if (error) {
            console.log(error);
        }
        if (docs.length === 0) {
            Item.insertMany(defaultItems, function (error) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Successfully added deafult items.");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", { listHead: "Today", newItems: docs });
        }
    });



});

app.get("/:customName", function (req, res) {
    const customListName = _.capitalize(req.params.customName);

    List.findOne({ name: customListName }, function (error, foundList) {
        if (error) {
            console.log(error);
        }
        else {
            if (foundList) {
                res.render("list", { listHead: foundList.name, newItems: foundList.list });

            }
            else {
                const list = new List({
                    name: customListName,
                    list: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            }
        }

    })

})

app.post("/", (req, res) => {



    const item = new Item({
        name: req.body.work
    })
    if (req.body.add === "Today") {
        item.save();
        res.redirect("/");

    }
    else {
        List.findOne({ name: req.body.add }, function (error, foundList) {
            foundList.list.push(item);
            foundList.save();
            res.redirect("/" + foundList.name);
        })
    }


})

app.post("/delete", (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;


    if (req.body.listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("successfully removed item");
            }
        })
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name:listName} ,{$pull: {list: {_id: checkedItemId}}},function(err,result){
            if(!err){
                console.log("successfully removed itemm form list");
                res.redirect("/"+ listName)
            }
        })
    }

})




app.get("/about", (req, res) => {
    res.render("about")
})


app.listen(3000, () => {
    console.log("Server started at port 3000");
});