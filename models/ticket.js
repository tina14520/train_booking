const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    client_id: {
      type: String,
      required: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: false
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      // required: true,
    },
    from: {
      type: String,
      min: 6,
      max: 255,
      required: true,
    },
    to: {
      type: String,
      min: 6,
      max: 255,
      required: true,
    },
    price: {
      type: String,
      required: false,
    },
    // seatID: {
    //   type:[String] ,
    //   required: true,
    //   // default: false,
    // },
    seats:{
      type:[{
        id: String,
        status: Boolean
      }],
      
      // required: true
    },
    // request_date: {
    //     type: Date.now(),
    //     required: true,
    // },
    date:{
      type:Date,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
