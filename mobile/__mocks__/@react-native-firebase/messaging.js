const messaging = () => ({
  requestPermission: jest.fn().mockResolvedValue(1),
  getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
  onTokenRefresh: jest.fn().mockReturnValue(() => {}),
  onMessage: jest.fn().mockReturnValue(() => {}),
  setBackgroundMessageHandler: jest.fn(),
});

messaging.AuthorizationStatus = {
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  DENIED: 0,
  NOT_DETERMINED: -1,
};

module.exports = messaging;
