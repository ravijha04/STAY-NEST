const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");




// INDEX ROUTE
router.get("/", wrapAsync(listingController.index));

//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);
//SHOW ROUTE
router.get("/:id", wrapAsync(listingController.showListing));

//CREATE ROUTE BUG FIX
router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//UPDATE ROUTE BUG FIX
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListig));

//DELETE ROUTE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;



// //CREATE ROUTE COURSE CODE
// app.post("/listings", validateListing, wrapAsync (async (req,res,next)=>{
//  const newListing = new Listing(req.body.listing);
//  await newListing.save();
// res.redirect("/listings");
// // let {title, description,image,price,country,location} = req.body;
// }));




// //UPDATE ROUTE course code
// app.put("/listings/:id",validateListing,wrapAsync( async (req,res)=>{
//     let {id} = req.params;
//   await   Listing.findByIdAndUpdate(id,{...req.body.listing});
//   res.redirect(`/listings/${id}`);
// }));


