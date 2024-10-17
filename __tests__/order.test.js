const axios = require('axios');
const { matchers } = require('jest-json-schema');
const { baseURL } = require('../config');

expect.extend(matchers);

describe('Store order API tests', () => {
	let orderId;
	const orderUrl = `${baseURL}/store/order`;

	const date = new Date().toISOString();
	const postData = {
		id: 1234,
		petId: 1234,
		quantity: 1000,
		shipDate: date,
		status: 'placed',
		complete: true,
	};

	it('GET store/inventory', async () => {
		const response = await axios.get(`${baseURL}/store/inventory`);

		expect(response.status).toBe(200);
	});

	it('POST /store/order - Positive: Add a new order', async () => {
		const response = await axios.post(`${orderUrl}`, postData);

		expect(response.status).toBe(200);

		orderId = response.data.id;

		expect(response.data).toHaveProperty('status', 'placed');
		expect(response.data).toStrictEqual({
			...postData,
			shipDate: `${date.replace(/Z$/, '+0000')}`,
		});
	});

	it('GET /store/order/{orderId} - Positive: Get order by ID', async () => {
		const response = await axios.get(`${orderUrl}/${orderId}`);
		expect(response.status).toBe(200);
		expect(response.data).toStrictEqual({
			...postData,
			shipDate: `${date.replace(/Z$/, '+0000')}`,
		});
	});

	it('GET /store/order/{orderId} - Negative: Get non-existent order', async () => {
		try {
			await axios.get(`${baseURL}/store/order/0`);
		} catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	it('Response time and headers validation', async () => {
		const startTime = Date.now();

		const response = await axios.get(`${orderUrl}/${orderId}`);

		const endTime = Date.now();

		const responseTime = endTime - startTime;

		console.log('Response time for orderId:', responseTime, 'ms');

		expect(response.headers).toHaveProperty('content-type');
		expect(response.headers['content-type']).toContain('application/json');

		expect(responseTime).toBeLessThan(500);
	});

	it('Validate JSON schema', async () => {
		const response = await axios.get(`${orderUrl}/${orderId}`);

		const storeSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				petId: { type: 'integer' },
				quantity: { type: 'integer' },
				shipDate: { type: 'string' },
				status: { type: 'string' },
				complete: { type: 'boolean' },
			},
			required: ['id', 'petId', 'status'],
		};

		expect(response.data).toMatchSchema(storeSchema);
	});

	it('DELETE /store/order/{orderId} - Positive: Delete order', async () => {
		const response = await axios.delete(`${orderUrl}/${orderId}`);
		expect(response.status).toBe(200);
	});
});
