const mongoose = require("mongoose");
const Product = require("./src/models/Product");
require("dotenv").config();

const productsToInsert = [
  {
    "name": "rado",
    "price": 30000,
    "category": "luxury",
    "images": [
      "https://i.pinimg.com/736x/d7/b1/70/d7b170bf4000eebcbf898a02b79e7609.jpg",
      "https://i.pinimg.com/736x/8d/4e/39/8d4e39dc2177476ac12f52c11d13fa8f.jpg"
    ],
    "description": "rado - f1",
    "stock": 28,
    "id": "849b"
  },
  {
    "id": "9daa",
    "name": "Rolex",
    "price": 23000,
    "category": "luxury",
    "images": [
      "https://i.pinimg.com/736x/b6/06/cd/b606cd879f745eaa99fba5955703ac95.jpg"
    ],
    "description": "limited edition",
    "stock": 21
  },
  {
    "name": "Rolex-48",
    "price": 35000,
    "category": "luxury",
    "images": [
      "https://i.pinimg.com/1200x/22/94/61/229461d3f114e066355da42f1674af68.jpg",
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772707949/gykspwonrpfgtywdrgol.jpg"
    ],
    "description": "nnscjsa",
    "stock": 19,
    "id": "0d22"
  },
  {
    "name": "HUBLUT",
    "price": 34000,
    "category": "sports",
    "images": [
      "https://i.pinimg.com/1200x/0c/f4/be/0cf4beb8947ab18bed03eb052587017d.jpg",
      "https://i.pinimg.com/736x/ea/2b/f8/ea2bf85b12de88af5bd1ec80424ad2ef.jpg",
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772773737/u5gkosugb1oewfgagku6.jpg"
    ],
    "description": "limited edition",
    "stock": 90,
    "id": "c461"
  },
  {
    "id": "2e8f",
    "name": "Hublot-g5",
    "price": 40000,
    "category": "casual",
    "images": [
      "https://i.pinimg.com/1200x/5b/a9/bc/5ba9bcfd64375acc17fd8de525d5f399.jpg"
    ],
    "description": "dwe f enewdnewfn",
    "stock": 30
  },
  {
    "name": "G-shoke",
    "price": 20000,
    "category": "sports",
    "images": [
      "https://i.pinimg.com/736x/fa/c7/0e/fac70e845de14866a260ea8227fba855.jpg",
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772707025/bpjtjxmyeeo85bdb8scc.jpg"
    ],
    "description": "sport watch",
    "stock": 5,
    "id": "2f78"
  },
  {
    "id": "df91",
    "name": "some items",
    "price": 30000,
    "category": "sports",
    "images": [
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772773681/pre9ircmxskttdkfszkl.jpg",
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772773688/o5qyneoaxf7txg6ayayf.jpg",
      "https://res.cloudinary.com/dit40na4i/image/upload/v1772773697/uz0fo3cbnhul5vyqnqgg.jpg"
    ],
    "description": "tfygfghfhggj",
    "stock": 89
  },
  {
    "name": "TITAN",
    "price": 25000,
    "category": "casual",
    "images": [
      "https://m.media-amazon.com/images/I/71DSA+AvbVL._AC_UL480_FMwebp_QL65_.jpg"
    ],
    "description": "Titan\nTitan Minimalist Quartz Analog with Date Black Dial Black Metal Strap",
    "stock": 17,
    "id": "a33c"
  },
  {
    "id": "6e4b",
    "name": "FASTTRACK",
    "price": 10000,
    "category": "casual",
    "images": [
      "https://m.media-amazon.com/images/I/41dannBuneL._AC_UL480_FMwebp_QL65_.jpg"
    ],
    "description": "Fastrack\nTees Analog Grey Dial Unisex-Adult Watch-68011PP08",
    "stock": 23
  }
];

async function insertProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully.");

    for (const p of productsToInsert) {
      const productData = {
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.images || [],
        stock: p.stock || 0,
        category: p.category,
        brand: p.brand || "",
        costPrice: p.costPrice || 0,
        isDeleted: false
      };

      // Upsert to avoid creating duplicate products if run multiple times
      const result = await Product.findOneAndUpdate(
        { name: p.name },
        productData,
        { upsert: true, 
          returnDocument: "after" }
      );
      console.log(`Product "${result.name}" inserted/updated successfully.`);
    }

    console.log("All products have been inserted/updated in the database.");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  }
}

insertProducts();
