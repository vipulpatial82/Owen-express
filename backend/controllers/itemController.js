const Item = require('../models/Item');

const defaultItems = [
    { name: "Butter Chicken", description: "Tender chicken in rich tomato and butter sauce", price: 350, image: "butterchicken.png" },
    { name: "Biryani", description: "Fragrant rice with spices and choice of meat", price: 280, image: "briyani.png" },
    { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 180, image: "Masaladosa.png" }
];

exports.getItems = async (req, res) => {
    try {
        let items = await Item.find();
        if (items.length === 0) items = await Item.insertMany(defaultItems);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { name, price, description, ingredients, type, isChefSpecial } = req.body;
        if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
        
        const item = new Item({ 
            name, 
            price, 
            description, 
            ingredients, 
            type: type || 'veg', 
            isChefSpecial: isChefSpecial === 'true' || isChefSpecial === true, 
            image: req.file?.filename || '' 
        });
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create item' });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { name, price, description, ingredients, type, isChefSpecial } = req.body;
        const updateData = { 
            name, 
            price, 
            description, 
            ingredients, 
            type, 
            isChefSpecial: isChefSpecial === 'true' || isChefSpecial === true 
        };
        if (req.file) updateData.image = req.file.filename;
        
        const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update item' });
    }
};
