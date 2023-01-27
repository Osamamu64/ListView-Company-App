const Company = require('../models/Company');
const Device = require('../models/Device');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


//@desc GET all companies
//@route GET /companies
//@access Private

const getAllCompanies = asyncHandler(async(req, res) => {
    const companies = await Company.find().lean();
    if (!companies.length) {
        return res.status(400).json({
            message: "No companies found"
        });
    }
    res.json(companies);

});


//@desc Create new company
//@route POST /companies
//@access Private

const createNewCompany = asyncHandler(async(req, res) => {
    const {
        name,
        username,
        password,
        version,
        count,
        city,
        contact
    } = req.body;

    //Confirm the data im getting
    if (!name || !username || !password || !version || !count || !city || !Array.isArray(contact) || !contact.length) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    //Check the data im getting for duplicates
    const duplicate = await Company.findOne({ name }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicated company name' });
    }

    //Hash the password of the User
    const hashPwd = await bcrypt.hash(password, 10);

    const companyObject = { name, username, "password": hashPwd, version, count, city, contact };

    //Create the user and store them
    const company = await Company.create(companyObject);

    if (company) {
        res.status(201).json({ message: `New company ${name} is created` });
    } else {
        res.status(400).json({ message: 'Invalid company data' });
    }

});


//@desc Update company
//@route PATCH /companies
//@access Private

const updateCompany = asyncHandler(async(req, res) => {
    const { id, name, username, version, count, city, contact, password } = req.body;

    //Confirm the data im getting
    if (!id || !name || !username || !version || !count || !city || !Array.isArray(contact) || !contact.length) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const company = await Company.findById(id).exec();

    if (!company) {
        res.status(400).json({ message: "Company not found" });
    }

    //Check the data im getting for duplicates
    const duplicate = await Company.findOne({ name }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return (res.status(409).json({ message: 'Duplicate company name' }));
    }

    company.name = name;
    company.username = username;
    company.version = version;
    company.count = count;
    company.city = city;
    company.contact = contact;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedCompany = await company.save();
    res.json({ message: `${updatedCompany.name} updated successfully` })

});


//@desc Delete company
//@route DELETE /companies
//@access Private

const deleteCompany = asyncHandler(async(req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Company ID Required' });
    }

    const device = await Device.findOne({ user: id }).lean().exec();
    if (device) {
        return res.status(400).json({ message: 'Company has assigned devices' });
    }

    const company = await Company.findOne({
        company: id
    }).exec();

    if (!company) {
        return res.status(400).json({ message: 'Company not found' });
    }

    const result = await company.deleteOne();

    const reply = `Company with name ${result.name} with ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {
    getAllCompanies,
    createNewCompany,
    updateCompany,
    deleteCompany
};