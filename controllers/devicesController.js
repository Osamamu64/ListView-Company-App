const User = require('../models/User');
const Device = require('../models/Device');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


//@desc GET all devices
//@route GET /devices
//@access Private

const getAllDevices = asyncHandler(async(req, res) => {
    const devices = await Device.find().lean();
    if (!devices.length) {
        return res.status(400).json({
            message: "No devices found"
        });
    }
    res.json(devices);

});


//@desc Create new device
//@route POST /devices
//@access Private

const createNewDevice = asyncHandler(async(req, res) => {
    const {
        name,
        username,
        password,
        ip_address,
        server
    } = req.body;

    //Confirm the data im getting
    if (!name || !username || !password || !ip_address || !server) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    //Check the data im getting for duplicates
    const duplicate = await Device.findOne({ name }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicated device name' });
    }

    //Hash the password of the User
    const hashPwd = await bcrypt.hash(password, 10);

    const deviceObject = { name, username, "password": hashPwd, ip_address, server };

    //Create the user and store them
    const device = await Device.create(deviceObject);

    if (device) {
        res.status(201).json({ message: `New Device ${name} is created` });
    } else {
        res.status(400).json({ message: 'Invalid device data' });
    }

});


//@desc Update device
//@route PATCH /devices
//@access Private

const updateDevice = asyncHandler(async(req, res) => {
    const { id, name, username, ip_address, server, password } = req.body;

    //Confirm the data im getting
    if (!id || !name || !username || !ip_address || !server) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const device = await Device.findById(id).exec();

    if (!device) {
        res.status(400).json({ message: "Device not found" });
    }

    //Check the data im getting for duplicates
    const duplicate = await Device.findOne({ name }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return (res.status(409).json({ message: 'Duplicated device name' }));
    }

    device.name = name;
    device.username = username;
    device.ip_address = ip_address;
    device.server = server;

    if (password) {
        device.password = await bcrypt.hash(password, 10);
    }

    const updatedDevice = await device.save();
    res.json({ message: `${updatedDevice.name} device updated successfully` })

});


//@desc Delete devie
//@route DELETE /devices
//@access Private

const deleteDevice = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Device ID Required' });
    }

    /*const device = await Company.findOne({ device: id }).lean().exec();
    if (device) {
        return res.status(400).json({ message: 'User has assigned companies' });
    }*/

    const device = await Device.findOne({
        device: id
    }).exec();

    if (!device) {
        return res.status(400).json({ message: 'Device not found' });
    }

    const result = await device.deleteOne();

    const reply = `Device ${result.name} with ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {
    getAllDevices,
    createNewDevice,
    updateDevice,
    deleteDevice
};