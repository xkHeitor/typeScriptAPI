import AuthService from "@src/sevices/auth";
import mongoose, { Document, Model } from "mongoose";

export interface User {
	_id?: string;
	name: string;
	email: string;
	password: string;
}

export enum CUSTOM_VALIDATION {
	DUPLICATED = 'DUPLICATED',
}

interface UserModel extends Omit<User, '_id'>, Document {}

const schema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		password: { type: String, required: true },
		email: { type: String, required: true, unique: true },
	}, {
		toJSON: {
			transform: (_, ret): void => {
				ret.id = ret._id;
				delete ret.id;
				delete ret._v;
			}
		}
	}
);

schema.path('email').validate(async (email: string) => {
	const emailCount = await mongoose.models.User.countDocuments({ email });
	return !emailCount;
}, 'already exists in the database.', CUSTOM_VALIDATION.DUPLICATED);

schema.pre<UserModel>('save', async function(): Promise<void> {
	if (!this.password || !this.isModified('password')) {
		return;
	}

	try {
		const hashedPassword = await AuthService.hashPassword(this.password);
		this.password = hashedPassword;
	}  catch (err: any) {
		console.error(`Error hashing the password for the user ${this.name}`)
	}

});

export const User: Model<UserModel> = mongoose.model('User', schema);