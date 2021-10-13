router = require("express").Router();
const { check, body } = require("express-validator");

const ticketController = require("../controllers/ticketCtrl");

router.post("/client/ticket/add_ticket",  
      [
            body("from", "Pease Enter a from ").not().isEmpty(),
            body("to", "Please Enter a to").not().isEmpty(),
            body("seatID","Please Enter a seat ID").not().isEmpty()
            // body("password", "Password should at least has a 6 characters")
      ],
      ticketController.add_ticket
);
router.get(
  "/client/ticket/get_tickets/:id",
  ticketController.get_tickets
);
router.get(
      "/client/ticket/get_tickets",
      ticketController.getAllTickets
);

module.exports = router;