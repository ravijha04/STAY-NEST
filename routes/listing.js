const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
     if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


// index route
router.get("/",wrapAsync( async (req,res)=>{
const allListings = await Listing.find({});
res.render("listings/index.ejs",{allListings});
}));

//NEW ROUTE
router.get("/new", (req,res)=>{
res.render("listings/new.ejs");
});
//SHOW ROUTE
router.get("/:id",wrapAsync(async (req,res)=>{
let {id} = req.params;
 const listing = await Listing.findById(id).populate("reviews");
 res.render("listings/show.ejs", {listing});

}));

//CREATE ROUTE BUG FIX
router.post("/", validateListing, wrapAsync (async (req,res,next)=>{
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
router.get("/:id/edit",wrapAsync(async (req,res)=>{
let {id} = req.params;
 const listing = await Listing.findById(id);
 res.render("listings/edit.ejs",{listing});
 console.log(listing);
}));

//UPDATE ROUTE BUG FIX
router.put("/:id",validateListing,wrapAsync( async (req,res)=>{
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
router.delete("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
   let deletedListing = await  Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   res.redirect("/listings");
}));

module.exports = router;