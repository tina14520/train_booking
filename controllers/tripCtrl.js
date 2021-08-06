const Trip = require('../../models/Trip')
const Driver = require('../../models/train')
const Client = require('../../models/Client')
const {
    validationResult
} = require('express-validator')


exports.add_trip = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const {
        name,
        train_id,
        client_id
    } = req.body

    const train = await Train.findOne({
        _id: train_id
    })
    const client = await Client.findOne({
        _id: client_id
    })

    const trip = await new Trip({
        name,
        train_id,
        client_id,
        train,
        client
    })
    console.log(trip)

    try {
        const savedTrip = await trip.save()
        res.status(201).json({
            message: "Success: Trip Created Successfully",
            trip: savedTrip
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.get_trips = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }
    const {
        train_id
    } = req.query
    console.log(train_id)

    // if(!driver_id) res.status(404).json({
    //     msg: "aa"
    // })
    
    const trips = await Trip.find({
        train_id
    })

    res.status(200).json({
        trips
    })

}