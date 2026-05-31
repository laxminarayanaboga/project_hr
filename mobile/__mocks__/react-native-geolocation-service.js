module.exports = {
  requestAuthorization: jest.fn().mockResolvedValue('granted'),
  getCurrentPosition: jest.fn((success) =>
    success({coords: {latitude: 51.5, longitude: -0.1}}),
  ),
};
