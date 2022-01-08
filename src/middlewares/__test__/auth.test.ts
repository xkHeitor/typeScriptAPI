import AuthService from "@src/sevices/auth";
import { authMiddleware } from "../auth";

describe('AuthMiddleware', () => {

	const sendMock = jest.fn();
	const nextFake = jest.fn();

	it ('Should verify a JWT token and call the next middleware', () => {
		const jwtToken = AuthService.generateToken({ data: 'fake' });
		const reqFake = {
			headers: { 'x-access-token': jwtToken }
		};
		
		const resFake = {};
		authMiddleware(reqFake, resFake, nextFake);
		expect(nextFake).toHaveBeenCalled();
	});

	it ('Should return UNAUTHORIZED if there is a problem on the token virification', () => {
		const reqFake = {
			headers: {
				'x-access-token': 'Invalid token'
			}
		};
		const resFake = {
			status: jest.fn(() => ({ send: sendMock }))
		};

		authMiddleware(reqFake, resFake as object, nextFake);
		expect(resFake.status).toHaveBeenCalledWith(401);
		expect(sendMock).toHaveBeenCalledWith({
			code: 401, error: 'jwt malformed'
		});
	});

	it('Should return ANAUTHORIZED middleware if theres no token', () => {
		const reqFake = { headers: {} };
		const resFake = {
			status: jest.fn(() => ({ send: sendMock }))
		};

		authMiddleware(reqFake, resFake as object, nextFake);
		expect(resFake.status).toHaveBeenCalledWith(401);
		expect(sendMock).toHaveBeenCalledWith({
			code: 401, error: 'jwt must be provided'
		});
	});

});