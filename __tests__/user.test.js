const axios = require('axios');
const { matchers } = require('jest-json-schema');
const { baseURL } = require('../config');

expect.extend(matchers);

describe('User API tests', () => {
	let username = 'lion';

	const userData = {
		id: 1234,
		username,
		firstName: 'John',
		lastName: 'Armstrong',
		email: 'john-test@gmail.com',
		password: '1qaz@WSX',
		phone: '+996123456789',
		userStatus: 12,
	};

	it('POST /user/createWithList - Positive: create user with list', async () => {
		const response = await axios.post(`${baseURL}/user/createWithList`, [
			userData,
		]);

		expect(response.status).toBe(200);
		expect(response.data).toStrictEqual({
			code: 200,
			type: 'unknown',
			message: 'ok',
		});
	});

	it('POST /user/createWithList - Negative: create user with list', async () => {
		try {
			await axios.post(`${baseURL}/user/createWithList`, userData);

			throw new Error('Request should have failed but succeeded');
		} catch (error) {
			expect(error.response.status).toBe(500);
			expect(error.response.data).toHaveProperty('code', 500);
			expect(error.response.data).toHaveProperty(
				'message',
				'something bad happened'
			);
		}
	});

	it('POST /user/createWithArray - Positive: create user with array', async () => {
		const response = await axios.post(`${baseURL}/user/createWithArray`, [
			userData,
		]);

		expect(response.status).toBe(200);
		expect(response.data).toStrictEqual({
			code: 200,
			type: 'unknown',
			message: 'ok',
		});
	});

	it('POST /user/createWithArray - Negative: create user with array', async () => {
		try {
			await axios.post(`${baseURL}/user/createWithArray`, userData);

			throw new Error('Request should have failed but succeeded');
		} catch (error) {
			expect(error.response.status).toBe(500);
			expect(error.response.data).toHaveProperty('code', 500);
			expect(error.response.data).toHaveProperty(
				'message',
				'something bad happened'
			);
		}
	});

	it('POST /user - Create a new user', async () => {
		const response = await axios.post(`${baseURL}/user`, userData);

		expect(response.status).toBe(200);
	});

	it('GET /user/${username} - Positive: get the user', async () => {
		const response = await axios.get(`${baseURL}/user/${username}`);

		expect(response.status).toBe(200);
		expect(response.data).toStrictEqual(userData);
	});

	it('GET /user/${username} - Negative: get the user', async () => {
		try {
			await axios.get(`${baseURL}/user/unknownUser`);

			throw new Error('Request failed with status code 404');
		} catch (error) {
			expect(error.response.statusText).toBe('Not Found');
		}
	});

	it('PUT /user/${username} - Update the user', async () => {
		const response = await axios.put(`${baseURL}/user/${username}`, {
			phone: '+996646457383',
		});

		expect(response.status).toBe(200);
	});

	it('GET /user/login - Get the user with the login and the password', async () => {
		const response = await axios.get(
			`${baseURL}/user/login?username=${userData.username}&password=${userData.password}`
		);

		expect(response.status).toBe(200);
	});

	it('GET /user/logout - Logout the user', async () => {
		const response = await axios.get(`${baseURL}/user/logout`);

		expect(response.status).toBe(200);
		expect(response.data.message).toBe('ok');
	});

	it('Response time and headers validation', async () => {
		const startTime = Date.now();

		const response = await axios.get(`${baseURL}/user/${username}`);

		const endTime = Date.now();

		const responseTime = endTime - startTime;

		console.log('Response time for get pet:', responseTime, 'ms');

		expect(response.headers).toHaveProperty('content-type');
		expect(response.headers['content-type']).toContain('application/json');

		expect(responseTime).toBeLessThan(500);
	});

	it('Validate JSON schema', async () => {
		const response = await axios.get(`${baseURL}/user/${username}`);

		const petSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				username: { type: 'string' },
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				email: { type: 'string' },
				password: { type: 'string' },
				phone: { type: 'string' },
				userStatus: { type: 'integer' },
			},
			required: ['id', 'username', 'userStatus'],
		};

		expect(response.data).toMatchSchema(petSchema);
	});

	it('DELETE /user/${username} - Positive: delete the user', async () => {
		const response = await axios.delete(`${baseURL}/user/${username}`);

		expect(response.status).toBe(200);
	});

	it('DELETE /user/${username} - Negative: delete the user', async () => {
		try {
			await axios.delete(`${baseURL}/user/unknownUser`);

			throw new Error('Request failed with status code 404');
		} catch (error) {
			expect(error.response.status).toBe(404);
			expect(error.response.statusText).toBe('Not Found');
		}
	});
});
