import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const CompanySchema = new mongoose.Schema({
	name: {
		type: String,
		require: true,
		
	},
	address: {
		type: String,
		require: false,
	},
	phone: {
		type: String,
		require: false,
	},
	email: {
		type: String,
		require: false,
		default: null,
	},
	website: {
		type: String,
		require: false,
		default: null,
	},
	Number_of_Employees: {
		type: Number,
		require: false,
		default: 0,
	},
	Founded_Date: {
		type: Date,
		require: false,
		default: null,
	},
	IndustryType:{
		type: String,
		enum : ['Technology', 'Finance', 'Healthcare', 'Retail','Other'],
		require:true,
	}
});

const ContactSchema = new mongoose.Schema({
	company_id: {
		type: ObjectId,
		require: true,
	},
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	phone: {
		type: String,
		require: false,
		default: null,
	},
	birthdate: {
		type: Date,
		require: false,
		default: null,
	},
	contact_type:{
		type: String,
		enum : ['Primary', 'Secondary', 'Other'],
		require:true,
	},
	
});

export const Company = mongoose.model('Company', CompanySchema);
export const Contact = mongoose.model('Contact', ContactSchema);

