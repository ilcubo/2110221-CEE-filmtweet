import Item from "../models/itemModel.js";

/** @type {import("express").RequestHandler} */
export const createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();

    res.status(200).json({ message: "OK" });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: "Bad Request" });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
};

/** @type {import("express").RequestHandler} */
export const getItems = async (req, res) => {
  const items = await Item.find();

  res.status(200).json(items);
};

/** @type {import("express").RequestHandler} */
export const deleteItem = async (req, res) => {
  res.status(501).send("Unimplemented");
};

/** @type {import("express").RequestHandler} */
export const filterItems = async (req, res) => {
  res.status(501).send("Unimplemented");
};
