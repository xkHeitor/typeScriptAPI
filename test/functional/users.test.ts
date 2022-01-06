import { User } from "@src/models/user";
import AuthService from "@src/sevices/auth";

describe('Users functional tests', () => {
	
	beforeEach(async () => {
		await User.deleteMany({});
	});

	const newUserDefault = { 
		name: 'John Doe', email: 'john@mail.com', password: '1234'
	};

	describe('When creating a new user', () => {

		it ('Should successfully create a new user with encrypted password', async () => {
			const response = await global.testRequest.post('/users').send(newUserDefault); 
			expect(response.status).toBe(201);
			await expect(AuthService.comparePasswords(newUserDefault.password, response.body.password))
				.resolves.toBeTruthy();
			expect(response.body).toEqual(expect.objectContaining({
				 ...newUserDefault, 
				 ...{ password: expect.any(String) } 
			}));
		});

		it ('Should return 400 when there is a validation error', async () => {
			const newUser = { email: 'john@mail.com', password: '1234' };
			const response = await global.testRequest.post('/users').send(newUser);
			expect(response.status).toBe(422);
			expect(response.body).toEqual({
				error: 'Unprocessable Entity',
				code: 422, 
				message: 'User validation failed: name: Path `name` is required.'
			});
		});

		it ('Should return 409 when the email already exists', async () => {
			await global.testRequest.post('/users').send(newUserDefault);
			const response = await global.testRequest.post('/users').send(newUserDefault);
			expect(response.status).toBe(409);
			expect(response.body).toEqual({
				error: 'Conflict',
				code: 409, 
				message: 'User validation failed: email: already exists in the database.'
			});
		});
	});

	describe('When authenticating a user', () => {

		it ('Should generate a token for a valid user', async () => {
			await new User(newUserDefault).save();
			const response = await global.testRequest.post('/users/authenticate').send({
				email: newUserDefault.email, password: newUserDefault.password
			});

			expect(response.body).toEqual(expect.objectContaining({ token: expect.any(String) }));
		});

		it ('Should return UNAUTHORIZED if the user with the given email is not found', async () => {
			const response = await global.testRequest.post('/users/authenticate').send({
				email: 'not-found@mail.com', password: newUserDefault.password
			});

			expect(response.status).toBe(401);
		});

		it ('Should return ANAUTHORIZED if the user is found but the password does not match', async () => {
			await new User(newUserDefault).save();
			const response = await global.testRequest.post('/users/authenticate').send({
				email: newUserDefault.email, password: 'different password'
			});

			expect(response.status).toBe(401);
		});

	});

});