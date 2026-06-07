const mockLoad = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../src/store/notificationStore', () => ({
  useNotificationStore: () => ({
    prefs: {
      leaveApproved: true,
      leaveRejected: false,
      leaveSubmitted: true,
      reviewReminders: false,
    },
    load: mockLoad,
    update: mockUpdate,
  }),
}));

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import NotificationPreferencesScreen from '../../src/screens/notifications/NotificationPreferencesScreen';

describe('NotificationPreferencesScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all preference rows', () => {
    const {getByTestId} = render(<NotificationPreferencesScreen />);
    expect(getByTestId('switch-leaveApproved')).toBeTruthy();
    expect(getByTestId('switch-leaveRejected')).toBeTruthy();
    expect(getByTestId('switch-leaveSubmitted')).toBeTruthy();
    expect(getByTestId('switch-reviewReminders')).toBeTruthy();
  });

  it('calls load on mount', () => {
    render(<NotificationPreferencesScreen />);
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('calls update when switch is toggled', () => {
    const {getByTestId} = render(<NotificationPreferencesScreen />);
    const switchEl = getByTestId('switch-leaveRejected');
    fireEvent(switchEl, 'valueChange', true);
    expect(mockUpdate).toHaveBeenCalledWith({leaveRejected: true});
  });
});
