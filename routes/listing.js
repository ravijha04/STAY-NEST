const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");




// index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//NEW ROUTE
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});
//SHOW ROUTE
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path : "reviews", populate : {
        path : "author",
    },
})
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });

}));

//CREATE ROUTE BUG FIX
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    req.body.listing.image = {
        filename: "listingimage",
        url: req.body.listing.image,
    };
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
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
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
    console.log(listing);
}));

//UPDATE ROUTE BUG FIX
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    req.body.listing.image = {
        filename: "listingimage",
        url: req.body.listing.image,
    };
    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));
// //UPDATE ROUTE course code
// app.put("/listings/:id",validateListing,wrapAsync( async (req,res)=>{
//     let {id} = req.params;
//   await   Listing.findByIdAndUpdate(id,{...req.body.listing});
//   res.redirect(`/listings/${id}`);
// }));
//DELETE ROUTE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;