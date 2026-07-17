const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wander_list";

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL); 
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("hii, i am root");
});

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
     if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
const validateReview = (req,res,next)=>{
    let {error} =reviewSchema.validate(req.body);
     if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
// index route
app.get("/Listings",wrapAsync( async (req,res)=>{
const allListings = await Listing.find({});
res.render("listings/index.ejs",{allListings});
}));

//NEW ROUTE
app.get("/listings/new", (req,res)=>{
res.render("listings/new.ejs");
});
//SHOW ROUTE
app.get("/Listings/:id",wrapAsync(async (req,res)=>{
let {id} = req.params;
 const listing = await Listing.findById(id).populate("reviews");
 res.render("listings/show.ejs", {listing});

}));

//CREATE ROUTE BUG FIX
app.post("/listings", validateListing, wrapAsync (async (req,res,next)=>{
    req.body.listing.image = {
        filename : "listingimage",
        url : req.body.listing.image,
    };
 const newListing = new Listing(req.body.listing);
 await newListing.save();
res.redirect("/listings");
}));

// //CREATE ROUTE COURSE CODE
// app.post("/listings", validateListing, wrapAsync (async (req,res,next)=>{
//  const newListing = new Listing(req.body.listing);
//  await newListing.save();
// res.redirect("/listings");
// // let {title, description,image,price,country,location} = req.body;
// }));

//EDIT ROUTE
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
let {id} = req.params;
 const listing = await Listing.findById(id);
 res.render("listings/edit.ejs",{listing});
 console.log(listing);
}));

//UPDATE ROUTE BUG FIX
app.put("/listings/:id",validateListing,wrapAsync( async (req,res)=>{
    let {id} = req.params;
    req.body.listing.image = {
        filename : "listingimage",
        url : req.body.listing.image,
    };
  await   Listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
}));
// //UPDATE ROUTE course code
// app.put("/listings/:id",validateListing,wrapAsync( async (req,res)=>{
//     let {id} = req.params;
//   await   Listing.findByIdAndUpdate(id,{...req.body.listing});
//   res.redirect(`/listings/${id}`);
// }));
//DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
   let deletedListing = await  Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));

//REVIEWS ROUTE

app.post("/listings/:id/reviews", validateReview , wrapAsync( async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//Rview delete route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let { id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId }});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));


// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By The Beach",
//         price: 1200,
//         location : "calcutta , Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let { statusCode = 500 , message="something wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080 ,()=>{
    console.log("server listening to port 8080");
});