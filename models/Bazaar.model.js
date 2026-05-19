const mongoose = require("mongoose");

const bazaarSchema = new mongoose.Schema({
    Fullname: {
    type: String,
    require:true
  },

  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["online", "offline", "hybrid"],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

address: {
  fullAddress: {
    type: String,
    required: function () {
      return this.type !== "online";
    }
  },

  googleMapsLink: {
    type: String

  },

  location: {
    lat: Number,
    lng: Number
  }
},

  capacity: {
    type: Number,
    default: 15
    },
  bookedSlots: {
  type: Number,
  default: 0
   },

  pricing: [
  {
    type: {
      type: String,
      enum: ["online", "offline"],
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }
    ],
 hybridPricing: {
  price: {
    type: Number
  },

  discount: {
    type: Number, 
    default: 0
  }
},

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
enum: ["draft", "open", "closed", "ongoing", "finished"],
default: "draft",
  },

  email: {
    type: String
  },

  phone: {
    type: String
  },

  socialLinks: {
    instagram: String,
    facebook: String,
    tiktok: String
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },
    payment: {
      provider: {
        type: String,
        enum: ["stripe", "paymob", "cashier"],
        default: "stripe"
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
      },
      transactionId: String
    },
automationRules: {
  enabled: {
    type: Boolean,
    default: false
  },

  closeWhenFull: {
    type: Boolean,
    default: false
  },


  closeBeforeHours: {
    type: Number,
    default: 24
  }
}

}, { timestamps: true });

module.exports = mongoose.model("Bazaar", bazaarSchema);