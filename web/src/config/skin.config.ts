import { Skin, macOsSkin } from '@prozilla-os/skins';

const defaultSkin = new Skin({
  ...macOsSkin,
  appNames: {
    ...macOsSkin.appNames,
  },
  defaultWallpaper: 'assets/wallpapers/abstract-inverse-wallpaper-gradient-blue-dark.png',
});

export { defaultSkin };
