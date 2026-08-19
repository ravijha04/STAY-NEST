const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage });


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
         validateListing,
         
          wrapAsync(listingController.createListing));
    
//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);    

router
.route("/:id")    
.get( wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListig))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));





//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


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


