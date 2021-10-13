const Ticket = require('../models/ticket')
const Client = require('../models/client')
const {
    validationResult
} = require('express-validator')


exports.add_ticket = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const {
        from,
        to,
        seats,
        date,
        client_id
    } = req.body
    const price = await Math.floor(1000 + Math.random() * 200);
    const client = await Client.findOne({
        _id: client_id
    })

    const ticket = await new Ticket({
        from,
        to,
        seats,
        date,
        price,
        client,
        client_id
    })
    console.log(ticket)

    try {
        const savedTicket = await ticket.save()
        res.status(201).json({
            message: "Success: Ticket Created Successfully",
            ticket: savedTicket
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.get_tickets = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const client_id=req.params.id
    console.log(client_id);
    const tickets = await Ticket.find({
      client_id
    });
  
    res.status(200).json({
        tickets
    })
}
exports.getAllTickets = async (req, res, next) => {
      var allTickets;
      await Ticket.find({})
        .populate("client")
        .exec((err, doc) => {
          allTickets = doc;
          res.status(200).json({
            allTickets
          });
        });;
    };
    