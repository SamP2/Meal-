module.exports = {
  expo: {
    name: 'Mess Finder',
    slug: 'mess-finder',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    ios: {
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Mess Finder needs your location to show nearby messes.',
      },
    },
    extra: {},
    web: {
      bundler: 'metro',
    },
  },
};
