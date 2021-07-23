export const getIsAdmin = (state) => state.session.user?.administrator;

export const getUserId = (state) => state.session.user?.id;

export const getDevices = (state) => Object.values(state.devices.items);

export const getItemPosition = (itemId) => (state) => state.positions.items[itemId];
