import { User } from "@src/models/user";
import AuthService from "@src/sevices/auth";

describe('Users functional tests', () => {
	
	beforeEach(async () => {
		await User.deleteMany({});
	});

	describe('When creating a new user', () => {

		const newUserDefault = { 
			name: 'John Doe', email: 'john@mail.com', password: '1234'
		};

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
				code: 422, error: 'User validation failed: name: Path `name` is required.'
			});
		});

		it ('Should return 409 when the email already exists', async () => {
			await global.testRequest.post('/users').send(newUserDefault);
			const response = await global.testRequest.post('/users').send(newUserDefault);
			expect(response.status).toBe(409);
			expect(response.body).toEqual({
				code: 409, error: 'User validation failed: email: already exists in the database.'
			});
		});
	});
});