const isClientAuth = require('../../config/authenticate/clientAuth');

router = require("express").Router();
const { check, body } = require("express-validator");

const clientController = require("../../controllers/clientCtrl");
// const ticketCtrl = require("../../controllers/ticketCtrl")
// router.post("/upload", clientController.uploadImg);
router.post(
  "/client/register",
  [
    body("name", "Pease Enter a name").not().isEmpty(),
    body("phone", "Please Enter a Valid Phone").isLength({
      min: 9,
    }),
    body("email").isEmail().withMessage("Please Enter a Valid Email"),
    body("password", "Password should at least has a 6 characters").isLength({
      min: 6,
    }),
    // body("profile_img", "Pease Enter a profile_img").not().isEmpty(),
  ],
  clientController.register
);
router.post("/client/login", clientController.login);
router.get( 
  "/client/get_otp",
    [
    check("phone", "Please Enter a Valid Phone").isLength({
      min: 9,
    }),
  ],
  clientController.getOtp
);

router.post( 
  "/client/validate_otp",
    [
      body("phone", "Please Enter a Valid Phone").isLength({
        min: 9,
      }),
      body("otp", "Please Enter a Valid OTP").not().isEmpty(),
  ],
  clientController.validateOtp
);

// Password
router.post("/driver/reset_password",  clientController.reset_password);
router.get("/driver/check_user_otp",  clientController.checkUserOtp);
// router.post("/client/add_trip", isClientAuth,  tripController.add_trip);



// router.get(
//   "/client/get_trips",isClientAuth,
//   clientController.get_trips
// );

// router.get("/client/get", isClientAuth , clientController.getClient);
router.get("/client/get_all_trips", isClientAuth,  clientController.getAllTrips);

// router.get("/client/search" ,clientController.searchClients);
// router.get('/client/check_version', clientController.checkVersion)
// router.get("/client/calculate_price",  ticketCtrl.calculatePrice);
// router.put('/client/update_place', clientController.addSavedPlaces);
router.get('/client/get_favourite_places',isClientAuth,  clientController.get_previous_trips);

router.post('/client/dash_register',[body("phone", "Please Enter a Valid Phone").not().isEmpty(),
body("name", "Please Enter a Valid Name").not().isEmpty()],clientController.dashRegister);
router.post('/add_passenger', [
      body("name", "Please Enter name").not().isEmpty(),
      body("email", "Please Enter a valid email").not().isEmpty().isEmail(),
      body("password", "Please Enter password").not().isEmpty(),
      body("phone", "Please Enter a valid phone").not().isEmpty().isMobilePhone()
  ], clientController.add_passenger);
  
  //READ ONE PASSENGER
  // router.get('/get_passenger/:id', clientController.get_passenger); 

  //UPDATE ONE PASSENGER 
  // router.put('/update_passenger/:id', clientController.update_passenger);


  // router.put('/disable_passenger/:id', clientController.disable_passenger);
   
  //DELETE ONE PASSENGER
  router.delete('/delete_passenger/:id', clientController.delete_passenger);
 
  //GET ALL Passengers
  router.get('/all', clientController.getAll);


module.exports = router;
